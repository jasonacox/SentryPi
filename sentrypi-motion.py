#!/usr/bin/python 
#
# This script reads the value from file written by the
# sentrypi service and publishes the JSON
#
# Jason A. Cox, @jasonacox
#   https://github.com/jasonacox/SentryPI

import time
import os
import glob
import time
import datetime

motion_file = "/var/www-tmp/sentrypi-movement"


def main():
    # Main program block
    count = 0

    try:
        with open(motion_file, 'r') as f:
            count = int(f.readline())
    except:
        count = 0

    with open(motion_file, 'w') as f:
        f.write("0\n")

    if (count > 10):
        count = 10
    now = datetime.datetime.utcnow()
    iso_time = now.strftime("%Y-%m-%dT%H:%M:%SZ")
    print("{ \"datetime\": \"%s\", \"motion\": %d }" % (iso_time, count))


if __name__ == '__main__':

    try:
        main()
    except KeyboardInterrupt:
        pass
