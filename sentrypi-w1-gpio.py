#!/usr/bin/python
#  
# Temp Probe - Using OneWire DS18B20 Proble w1-gpio - JSON Output
#
# Note: This requires that the w1-gpio interfaces are activated in the kernel
#       via: sudo raspi-config 
#	     or edit /boot/config.txt and add dtoverlay=w1-gpio

import os
import glob
import time
import datetime

base_dir = '/sys/bus/w1/devices/'
# NOTE: Set the device ID here - 28-
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
            break


if __name__ == '__main__':

    try:
        main()
    except KeyboardInterrupt:
        pass
