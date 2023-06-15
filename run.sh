#!/bin/bash
set -x

yarn build

while true
do
    yarn start
    sleep 10
done