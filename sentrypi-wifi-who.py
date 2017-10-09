#!/usr/bin/python
#  
# Track Who - WifiScan for MAC addresses - JSON Output
#
# Description:
#    This script scans WiFi for MAC addressess and returns JSON list

import os
import glob
import time
import datetime
import json

#
# Config Settings
#

ARPCMD="sudo arp-scan -lq | egrep \"([0-9a-f][0-9a-f]:){5}\" | awk '{print $2}' | sort | uniq"

#
# Main
#

def get_macs():
    res = [x.strip() for x in os.popen(ARPCMD).readlines()]
    return res

def main():
    # Main program block
    now = datetime.datetime.utcnow()
    iso_time = now.strftime("%Y-%m-%dT%H:%M:%SZ")
    macs = get_macs()
    print("{ \"datetime\": \"%s\", \"macs\": %s }" % (iso_time, json.dumps(macs)))


if __name__ == '__main__':

    try:
        main()
    except KeyboardInterrupt:
        pass
