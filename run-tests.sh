#!/bin/bash -ex

python test.py

cd js-test
./../node_modules/karma/bin/karma start conf.js
cd ..

./integration-testrunner.sh
