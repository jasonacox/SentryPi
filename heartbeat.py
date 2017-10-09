#!/usr/bin/python
#
# Simple Heartbeat Script to flash LED

import glob
import time
import datetime
import RPi.GPIO as GPIO

## set GPIO pins to use
led_pin = 17

def main():
  # Main program block
  GPIO.setwarnings(False)
  GPIO.setmode(GPIO.BCM)       # Use BCM GPIO numbers
  GPIO.setup(led_pin, GPIO.OUT) # activate LED
 
  # Flash LED

  GPIO.output(led_pin,GPIO.HIGH)
  time.sleep(0.1)
  GPIO.output(led_pin,GPIO.LOW)

if __name__ == '__main__':

  try:
    main()
  except KeyboardInterrupt:
    pass
