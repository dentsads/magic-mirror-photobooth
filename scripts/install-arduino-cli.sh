#!/bin/bash


if ! which arduino-cli > /dev/null; then
   echo "arduino-cli package was not found. Please install it from here: https://arduino.github.io/arduino-cli/latest/installation/ or install it like this:"
   echo "curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | sudo BINDIR=/usr/local/bin sh"
   exit 1
fi

if ! which git > /dev/null; then
   echo "git package was not found. Please install it like this: sudo apt-get install git"
   exit 1
fi

git clone https://github.com/ajfisher/node-pixel.git /tmp/node-pixel --branch v0.10.5

arduino-cli core install arduino:samd
arduino-cli core install arduino:avr
arduino-cli compile --fqbn arduino:avr:micro /tmp/node-pixel/firmware/build/node_pixel_firmata/
sudo arduino-cli upload -p /dev/ttyACM0 --fqbn arduino:avr:micro /tmp/node-pixel/firmware/build/node_pixel_firmata/