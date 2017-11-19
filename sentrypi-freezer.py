#!/usr/bin/python
# -*- coding: utf-8 -*-
#  
# Freezer Status - JSON Output
# 
# Description:
#    This script reads the 1-wire freezer temperature and prints JSON
#    Additionally, this script will send SNS messages if temperature
#    rises above ALERTTEMP or above freezing.
#
# Jason A. Cox, @jasonacox
#   https://github.com/jasonacox/SentryPI

import os
import RPi.GPIO as io
import boto3
import glob
import time
import datetime

#
# Config Settings
#

# Create an SNS client for alerts
client = boto3.client(
    "sns",
    aws_access_key_id="--------------------",
    aws_secret_access_key="----------------------------------------",
    region_name="us-east-1")
SNSTopicArn = "arn:aws:sns:us-east-1:------------:SentryPiAlerts"

## read temp from DS18B20 1-Wire Probe
base_dir = '/sys/bus/w1/devices/'
device_folder = glob.glob(base_dir + '28-0516a30385ff*')[0]
device_file = device_folder + '/w1_slave'
freezer_file = "/var/www-tmp/sentrypi-freezer"
freezer_thaw_file = "/var/www-tmp/sentrypi-freezer-thaw"

# Alert values in C
ALERTTEMP = -10
THAWTEMP = 0

#
# Functions
#


def read_temp_raw():
    f = open(device_file, 'r')
    lines = f.readlines()
    f.close()
    return lines


def read_temp():
    lines = read_temp_raw()
    while lines[0].strip()[-3:] != 'YES':
        time.sleep(0.2)
        lines = read_temp_raw()
    equals_pos = lines[1].find('t=')
    if equals_pos != -1:
        temp_string = lines[1][equals_pos + 2:]
        temp_c = float(temp_string) / 1000.0
        return temp_c


#
# Main Function
#


def main():
    # Main program block
    watchdog = 0

    while watchdog < 10:
        watchdog = watchdog + 1
        now = datetime.datetime.utcnow()
        iso_time = now.strftime("%Y-%m-%dT%H:%M:%SZ")
        ftemp = read_temp()
        if ftemp != 85:
            print(
                "{ \"datetime\": \"%s\", \"temperature\": %f, \"humidity\": %d }"
                % (iso_time, ftemp, 0))
            if ftemp >= THAWTEMP:
                # freezer thawing
                client.publish(
                    Message="Freezer FAILURE (%0.1f°F)" % ((1.8 * ftemp) + 32),
                    TopicArn="%s" % SNSTopicArn)
            # check for alert but send only 1
            if ftemp > ALERTTEMP and os.path.isfile(freezer_file) == False:
                # freezer too hot!
                client.publish(
                    Message="Freezer Temp WARNING (%0.1f°F)" % (
                        (1.8 * ftemp) + 32),
                    TopicArn="%s" % SNSTopicArn)
                os.system("touch %s" % freezer_file)
            if ftemp <= ALERTTEMP and os.path.isfile(freezer_file) == True:
                os.remove(freezer_file)
                client.publish(
                    Message="Freezer Temp Good (%0.1f°F)" % (
                        (1.8 * ftemp) + 32),
                    TopicArn="%s" % SNSTopicArn)
            break


if __name__ == '__main__':

    try:
        main()
    except KeyboardInterrupt:
        pass
