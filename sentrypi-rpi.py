#!/usr/bin/python
# 
# Temp Probe on RPI - JSON Output
#

import os
import glob
import time
import datetime
import RPi.GPIO as GPIO

## read temp from DS18B20 OneWire Probe
base_dir = '/sys/bus/w1/devices/'
device_folder = glob.glob(base_dir + '28-*')[0]
device_file = device_folder + '/w1_slave'


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


def main():
    # Main program block

    while True:
        now = datetime.datetime.utcnow()
        iso_time = now.strftime("%Y-%m-%dT%H:%M:%SZ")
        print("{ \"datetime\": \"%s\", \"temperature\": %f, \"humidity\": %d }"
              % (iso_time, read_temp(), 0))
        break


if __name__ == '__main__':

    try:
        main()
    except KeyboardInterrupt:
        pass
