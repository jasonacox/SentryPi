#!/bin/bash
#
# Watchdog Script for SentryPi
#
# Description:
#   This watchdown scripts monitors connectivity to the gateway
#   and if it fail to respond 10 times, it will reboot the RPi
#
# Jason A. Cox, @jasonacox
#   https://github.com/jasonacox/SentryPI

GW=`/sbin/ip route | awk '/default/ { print $3 }'`
#GW=10.1.1.1
echo "GW = $GW"

for N in 1 2 3 4 5 6 7 8 9 10
do
	if ping -q -c 1 -W 1 $GW >/dev/null; then
	  echo "GW is up"
	  exit 0
	else
	  echo "GW is down - try $N"
	  sleep 5
	fi
done

echo  "Unable to Recover - Rebooting..."
sudo shutdown -r now
