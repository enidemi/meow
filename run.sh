#!/bin/bash -x

gunicorn -b 0.0.0.0:5000 -k flask_sockets.worker chat:app
