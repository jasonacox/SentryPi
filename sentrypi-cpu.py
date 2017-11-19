#!/usr/bin/python
#  
# Temp Probe - CPU Status - JSON Output
#
# Jason A. Cox, @jasonacox
#   https://github.com/jasonacox/SentryPI

import os
import glob
import time
import datetime


def cpu_temp():
    result = 0
    mypath = "/sys/class/thermal/thermal_zone0/temp"
    with open(mypath, 'r') as mytmpfile:
        for line in mytmpfile:
            result = line
    return float(int(result) / 1000.0)


def gpu_temp():
    res = os.popen('/opt/vc/bin/vcgencmd measure_temp').readline()
    return res.replace("temp=", "")


def main():
    # Main program block

    now = datetime.datetime.utcnow()
    iso_time = now.strftime("%Y-%m-%dT%H:%M:%SZ")
    ftemp = cpu_temp()
    cpuload = os.getloadavg()[1]  # 5 min load avg
    print("{ \"datetime\": \"%s\", \"temperature\": %f, \"cpuload\": %f }" %
          (iso_time, ftemp, cpuload))


if __name__ == '__main__':

    try:
        main()
    except KeyboardInterrupt:
        pass
