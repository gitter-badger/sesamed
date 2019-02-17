#!/bin/bash

echo "Waiting for Ganache to launch on 8545..."

while ! nc -z localhost 8545; do
  sleep 0.1 # wait for 1/10 of the second before check again
done

echo "Truffle launched!"
