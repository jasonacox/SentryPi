#!/bin/bash
#
# Record Door Status
#   
# Description:
#    This script is run by the sentrypi service daemon to record
#    state change of the door - open or closed in dynamodb
#

TD=`sudo python /home/pi/iot/sentrypi-door.py`
curl -s --cacert /home/pi/iot/certs/root-CA.crt \
	--cert /home/pi/iot/certs/----------.cert.pem \
	--key /home/pi/iot/certs/----------.private.key -X POST -d "$TD" \
	"https://-------------.iot.us-east-1.amazonaws.com:8443/topics/sentryPi/door?qos=1" > /dev/null

