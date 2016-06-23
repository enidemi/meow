# -*- coding: utf-8 -*-

import random
import time
import os
import logging
import gevent
import json

from flask import Flask, render_template
from flask_sockets import Sockets

app = Flask(__name__)
app.debug = 'DEBUG' in os.environ

sockets = Sockets(app)

class Room:
    def __init__(self, name):
        self.clients = []
        self.name = name

    def register(self, client):
        if client not in self.clients:
            self.clients.append(client)
            print "client registered", len(self.clients)

    def get_clients(self):
        return self.clients

    def remove(self, client):
        self.clients.remove(client)

    def is_client_in_room(self, client):
        if client in self.clients:
            return True
        return False

class ChatBackend:
    def __init__(self):
        self.rooms = []

    def does_room_exist(self, name):
        for room in self.rooms:
            if room.name == name:
                return room
        return None

    def register_room(self, name, client):
        new_room = self.does_room_exist(name)
        if new_room is None:
            new_room = Room(name)
            self.rooms.append(new_room)
            if new_room.name != "waiting_area":
                client.send(json.dumps({"text": "first"}))
            print "new room registered", new_room.name
        can_game_be_started = len(new_room.clients) == 1
        original_length = len(new_room.clients)
        new_room.register(client)
        if (original_length != len(new_room.clients)):
            self.send_room_changes()
        if len(new_room.clients) == 2 and can_game_be_started:
            self.send_room_changes()
            if new_room.name != "waiting_area":
                self.send_random_session_id(new_room.name)

    def send_random_session_id(self, room_name):
        session_id = int(random.random() * 100);
        self.send(json.dumps({"text": {"start": True, "sessionId": session_id, "room_name": room_name, "time": int(time.time()*1000)}}), room_name, None)

    def send(self, data, target, sender):
        for room in self.rooms:
            if room.name == target:
                clients = room.get_clients()
                for client in clients:
                    if sender == client:
                        pass
                    else:
                        try:
                            text = json.loads(data)
                            text["text"]["time"] = int(time.time()*1000)
                            client.send(json.dumps(text))
                            print "client send", int(time.time()*1000), json.dumps(text)
                        except Exception:
                            print "client exception"
                            room.remove(client)

    def delete_client(self, client):
        for room in self.rooms:
            if room.is_client_in_room(client):
                room.remove(client)
                self.check_if_empty(room)
                self.send_room_changes()

    def check_if_empty(self, room):
        if len(room.get_clients()) == 0:
            self.rooms.remove(room)

    def send_room_changes(self):
        player_count = []
        room_names = []
        for room in self.rooms:
            player_count.append(len(room.get_clients()))
            room_names.append(room.name)
        for room in self.rooms:
            self.send(json.dumps({"text": {"rooms": room_names, "player_count": player_count}}), room.name, None)

chats = ChatBackend()

@app.route('/')
def hello():
    return render_template('index.html')

@sockets.route('/submit')
def inbox(ws):
    while ws.socket is not None:
        # wtf is this
        gevent.sleep(0.00001)
        message = ws.receive()

        if message:
            parse_message(message, ws, chats)

def parse_message(message, ws, chats):
    text = json.loads(message)
    if text.get("close") is not None:
        print "close"
        chats.delete_client(ws)
    elif text.get("reset") is True:
        room_name = text["room"]
        chats.send_random_session_id(room_name)
    elif text.get("room") is not None:
        print "client received", int(time.time()*1000), text
        room_name = text["room"]
        chats.register_room(room_name, ws)

        chats.send(message, room_name, None)
    else:
        return "error"

if __name__ == '__main__':
    app.run()
