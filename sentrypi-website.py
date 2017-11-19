#!/usr/bin/python
# -*- coding: utf-8 -*-
#
# Website Status - JSON Output
#
# Description:
"""
    This script checks to see if a website is running and records
    the time (ms) to download the URL. Additionally, this script 
    will send SNS messages if the site is down for 2 consecutive tries.
"""
#
# Jason A. Cox, @jasonacox
#   https://github.com/jasonacox/SentryPI

import os
import time
import datetime
import urllib2
import socket
import boto3

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

## Site to check and counter file
SITE = "http://google.com"
#SITE = "http://notexist.kc"
CHECK = 2
STATUSFILE = "/var/www-tmp/sentrypi-webdown"

#
# Functions
#

current_milli_time = lambda: int(round(time.time() * 1000))


def check_url(url, timeout=5):
    """ Returns time in ms to load or -1 if down or error """
    startms = current_milli_time()
    try:
        result = urllib2.urlopen(url, timeout=timeout).getcode() < 400
        loadtime = current_milli_time() - startms
        if result is True:
            return loadtime
        if result is False:
            return -1
    except urllib2.URLError:
        return -1
    except socket.timeout:
        return -1


#
# Main Function
#


def main():
    """ Main program block """
    watchdog = 0

    while watchdog < CHECK:
        watchdog = watchdog + 1
        now = datetime.datetime.utcnow()
        iso_time = now.strftime("%Y-%m-%dT%H:%M:%SZ")
        webstatus = check_url(SITE)
        if webstatus > 0:
            # Site UP
            # check if it was down prior
            if os.path.isfile(STATUSFILE):
                os.remove(STATUSFILE)
                client.publish(
                    Message="Website UP (%s) - %dms" % (SITE, webstatus),
                    TopicArn="%s" % SNSTopicArn)
            #
            print(
                "{ \"datetime\": \"%s\",\"site\": \"%s\",\"state\": %d,\"loadtime\": %d }"
                % (iso_time, SITE, 1, webstatus))
            break
        if webstatus < 0:
            # Site DOWN
            if os.path.isfile(STATUSFILE):
                # Already Alerted
                break
            if watchdog < CHECK:
                # Wait 5s and try again
                time.sleep(5)
                continue
            if watchdog >= CHECK:
                os.system("touch %s" % STATUSFILE)
                client.publish(
                    Message="Website DOWN (%s)" % SITE,
                    TopicArn="%s" % SNSTopicArn)
                print(
                    "{ \"datetime\": \"%s\",\"site\": \"%s\",\"state\": %d,\"loadtime\": %d }"
                    % (iso_time, SITE, 0, webstatus))


if __name__ == '__main__':

    try:
        main()
    except KeyboardInterrupt:
        pass
