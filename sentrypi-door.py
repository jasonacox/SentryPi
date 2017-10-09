#!/usr/bin/python
#
# Garage Door Status - JSON Output

import glob
import time
import datetime
import RPi.GPIO as io
import os

#define GPIO 
## set GPIO mode to BCM - allows us to use GPIO number instead of pin number
io.setmode(io.BCM)
io.setwarnings(False)

## set GPIO pins to use
door_pin = 23
door_file = "/var/www-tmp/sentrypi-door"

door = 0  #closed

## use the built-in "pull-up" resistor
io.setup(door_pin, io.IN, pull_up_down=io.PUD_UP)  # activate input

## if switch is open
if io.input(door_pin) == True:
    door = 0
    if (os.path.exists(door_file)):
        os.remove(door_file)
else:
    door = 1
    if (os.path.exists(door_file) <> True):
        open(door_file, 'w').close()

now = datetime.datetime.utcnow()
iso_time = now.strftime("%Y-%m-%dT%H:%M:%SZ")
print("{ \"datetime\": \"%s\", \"door\": %d, \"sensor2\": %d }" %
      (iso_time, door, 0))
