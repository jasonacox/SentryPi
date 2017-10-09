#!/usr/bin/python
#
# DHT11 Sensor Status - JSON Output
#
# Description:
#    This script reads humidity from DHT11 sensor and temperature
#    from a OneWire DS18B20 probe.

import os
import glob
import time
import datetime
import dht11
import RPi.GPIO as GPIO

# 
# Config Settings
#

## set GPIO pins to use
Temp_sensor = 14
door_pin = 23

## read temp from DS18B20 OneWire Probe
base_dir = '/sys/bus/w1/devices/'
device_folder = glob.glob(base_dir + '28-*')[0]
device_file = device_folder + '/w1_slave'

#
# Fucntions
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
        #temp_f = temp_c * 9.0 / 5.0 + 32.0
        #return temp_c, temp_f
        return temp_c


#
# Main
#


def main():
    # Main program block
    GPIO.setwarnings(False)
    GPIO.setmode(GPIO.BCM)  # Use BCM GPIO numbers
    instance = dht11.DHT11(pin=Temp_sensor)

    while True:
        #get DHT11 sensor value
        now = datetime.datetime.utcnow()
        iso_time = now.strftime("%Y-%m-%dT%H:%M:%SZ")
        result = instance.read()
        if result.humidity > 0.0:
            #print JSON output
            #print("{ \"datetime\": \"%s\", \"temperature\": %d, \"humidity\": %d }" % (iso_time, result.temperature, result.humidity))
            print(
                "{ \"datetime\": \"%s\", \"temperature\": %f, \"humidity\": %d }"
                % (iso_time, read_temp(), result.humidity))
            break


if __name__ == '__main__':

    try:
        main()
    except KeyboardInterrupt:
        pass
