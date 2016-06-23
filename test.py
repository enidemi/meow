import unittest
import chat
import json
from flask import Flask
from mock import Mock, patch

class MyTest(unittest.TestCase):

    def create_app(self):

        app = Flask(__name__)
        app.config['TESTING'] = True
        return app

    def test_json(self):
        message = json.dumps({"text": {"start": True, "sessionId": 1, "room_name": 1, "time": 1}})
        response = chat.parse_message(message, "", "")
        self.assertEqual(response, "error")

    def test_room(self):
        no = chat.chats.does_room_exist("cica")
        self.assertEqual(no, None)

    def test_parse_message_close(self):
        chats = Mock()
        ws = Mock()
        message = json.dumps({"close": True})
        chat.parse_message(message, ws, chats)
        chats.delete_client.assert_called_with(ws)

class ChatBackendTest(unittest.TestCase):

    def test_register_new_room(self):
        chatbackend = chat.ChatBackend()
        client = Mock()
        chatbackend.register_room("cica", client)
        self.assertEqual(client.send.call_count, 2) # :(
        self.assertEqual(len(chatbackend.rooms), 1)
        self.assertEqual(chatbackend.rooms[0].name, "cica")

    def test_register_second_client(self):
        chatbackend = chat.ChatBackend()
        client = Mock()
        client2 = Mock()
        chatbackend.send_room_changes = Mock()
        chatbackend.register_room("cica", client)
        chatbackend.register_room("cica", client2)
        self.assertEqual(chatbackend.rooms[0].name, "cica")
        self.assertEqual(len(chatbackend.rooms[0].clients), 2)
        self.assertEqual(chatbackend.send_room_changes.call_count, 3)


if __name__ == '__main__':
    unittest.main()
