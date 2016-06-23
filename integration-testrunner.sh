#!/bin/bash -ex

./run.sh &

node integration-tests/two-players-join.js
node integration-tests/direction-change.js
node integration-tests/snake-collision.js

killall python
