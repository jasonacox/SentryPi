#!/usr/bin/python
#
# Raspberry Pi Home Sentry - RPI script to monitor home
#
# Version: 0.1 
#
# Descripton: 
#    Service to watch door status and alert if door is left open too long.
#    Uses motion sensor to detect motion and delay alert.
#    Illuminates LED when door is open.
#
# Jason A. Cox, @jasonacox
#   https://github.com/jasonacox/SentryPI

# load libraries
import os
import RPi.GPIO as io
import time
import boto3
import utils

# set GPIO mode to BCM - allows us to use GPIO number instead of pin number
io.setmode(io.BCM)
io.setwarnings(False)

#
# Config Settings
#

# Alert timeouts - send notification
ALERTTIME = 300
ALERTNOMOTION = 100
ALERTMAX = 600

# Create an SNS client for alerts
client = boto3.client(
    "sns",
    aws_access_key_id="--------------------",
    aws_secret_access_key="----------------------------------------",
    region_name="us-east-1")
SNSTopicArn = "arn:aws:sns:us-east-1:------------:SentryPiAlerts"

# Mute alerting file
MUTE_FILE = "/var/www-tmp/sentrypi-mute"

# Motion file
MOTION_FILE = "/var/www-tmp/sentrypi-movement"

# set GPIO pins to use
DOOR_PIN = 23
LED_PIN = 17
MOTION_PIN = 24

# AWS IoT Command
DoorCMD = "/bin/bash /home/pi/iot/door-pub.sh"

#
# Start
#

print "SentryPi Started\n\n"
print("Sentry Activated - Watching: GPIO %d" % DOOR_PIN)
print("  Using LED on GPIO %d" % LED_PIN)

# use the built-in "pull-up" resistor
io.setup(DOOR_PIN, io.IN, pull_up_down=io.PUD_UP)  # activate input
io.setup(LED_PIN, io.OUT)  # activate LED
io.setup(MOTION_PIN, io.IN)

# States for door: 0=closed, 1=open, 2=init
door = 2
watchcount = 0
alertset = False
count = 0
lastmotion = 0

# log state to AWS IoT  
os.system(DoorCMD)

#
# Main Loop
#
try:
    while True:
        # check for motion
        if (io.input(MOTION_PIN) == True):
            lastmotion = watchcount
            try:
                with open(MOTION_FILE, 'r+') as f:
                    count = int(f.readline()) + 1
                    f.seek(0)
                    f.write(str(count))
            except:
                with open(MOTION_FILE, 'w') as f:
                    f.write("0\n")

        # if switch is open - DOOR CLOSED
        if (io.input(DOOR_PIN) == True and door != 0):
            door = 0
            print("Door closed after %s" % utils.sectext(watchcount))
            # do some action
            io.output(LED_PIN, io.LOW)
            # log in AWS IoT
            os.system(DoorCMD)
            if (alertset == True):
                # ALERT - send notification
                alertset = False
                # verify the notification is not muted
                if (os.path.isfile(MUTE_FILE) <> True):
                    print(" - Send notification")
                    client.publish(
                        Message="Garage Closed %s" % utils.sectext(watchcount),
                        TopicArn="%s" % SNSTopicArn)
        # if switch is closed - DOOR OPEN
        if (io.input(DOOR_PIN) == False and door != 1):
            door = 1
            watchcount = 0
            lastmotion = 0
            print "Door open"
            io.output(LED_PIN, io.HIGH)
            # log in AWS IoT
            os.system(DoorCMD)
        if (door == 1):
            watchcount = watchcount + 1
            io.output(LED_PIN, io.HIGH)
            print("\rCount: %ds" % watchcount)
            if (watchcount > ALERTTIME and
                (((watchcount - lastmotion) > ALERTNOMOTION) or
                 watchcount > ALERTMAX) and alertset == False):
                # ALERT - send notification
                alertset = True
                if (os.path.isfile(MUTE_FILE) <> True):
                    print(" - Send notification")
                    client.publish(
                        Message="Garage Open %s" % utils.sectext(watchcount),
                        TopicArn="%s" % SNSTopicArn)
            if (alertset == True):
                # ALERT - flash LED
                io.output(LED_PIN, io.LOW)
                time.sleep(0.2)  # 1 second wait
                io.output(LED_PIN, io.HIGH)

        time.sleep(1)  # 1 second wait
        # if switch is open - DOOR CLOSED
    # while True:

except KeyboardInterrupt, e:
    print("Stopping SentryPi...")
