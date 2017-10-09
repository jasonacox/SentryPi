#!/usr/bin/python
#
# BMP085 Barometric Probe - JSON Output

import Adafruit_BMP.BMP085 as BMP085
import time
import datetime

sensor = BMP085.BMP085()

#print('Temp = {0:0.2f} *C'.format(sensor.read_temperature()))
temp = sensor.read_temperature()
#print('Pressure = {0:0.2f} Pa'.format(sensor.read_pressure()))
pressure = sensor.read_pressure()
#print('Altitude = {0:0.2f} m'.format(sensor.read_altitude()))
altitude = sensor.read_altitude()
#print('Sealevel Pressure = {0:0.2f} Pa'.format(sensor.read_sealevel_pressure()))
seapressure = sensor.read_sealevel_pressure()

now = datetime.datetime.utcnow()
iso_time = now.strftime("%Y-%m-%dT%H:%M:%SZ")
print(
    "{ \"datetime\": \"%s\", \"temperature\": %f, \"pressure\": %d, \"altitude\": %f, \"seapressure\": %f }"
    % (iso_time, temp, pressure, altitude, seapressure))
