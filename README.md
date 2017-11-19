# SentryPi
Tools to help build a home monitoring platform using a Raspberry Pi

### Introduction
Have you ever driven away from your house and wondered if you left the garage open? It seems like it is usually just far enough away yet with enough uncertainty to make you turn around and check.  Wouldn't it be nice to get a text message if it was open too long or go to a website to see if it was closed?  Do you ever worry about the freezer and wonder if you closed the door tight enough to keep things from thawing?  Wouldn't it be great to get an alert if the temperature gets too high?  SentryPi can help!  

SentryPi is a collection of Python scripts for a Raspberry Pi that use AWS services to record and notify based on sensors (switches, temperature, motion, etc.). Recorded sensor data is stored in DynamoDB that can be rendered on a dashboard with he example Chart.js graphs.

For more information on installing a switch to monitor a garage door: [see details here](http://www.jasonacox.com/wordpress/archives/355). 

## Setup Basics
The following will help you set up your Raspberry Pi as a platform to install the SentryPi scripts.

Required: 
* Raspberry Pi - B+, 2 or 3
* WiFi Dongle or Network Cable configured 
* SD card (Recommend: 16GB or larger)
* AWS Account (IoT, DynamoDB)

Sensors:
* Temperature Probe - [DS18B20](https://www.amazon.com/gp/product/B00CHEZ250/ref=oh_aui_search_detailpage?ie=UTF8&psc=1)
* Humidity Sensor - DHT11 
* Barometric Pressure Sensor - BMP180 
* Sensor Kit - [KOOKYE 16 in 1](https://www.amazon.com/gp/product/B01J9GD3DG/ref=oh_aui_search_detailpage?ie=UTF8&psc=1)]

### Rasperian 
Install the Raspberry Pi operating system onto an SD card.  
https://www.raspberrypi.org/documentation/installation/installing-images/

Boot the Raspberry Pi and update Rasperian packages:
```bash
sudo apt-get update
sudo apt-get upgrade -y
````

### Activate i2c and w1 Interfaces
```bash
sudo raspi-config
sudo vi /boot/config.txt

	dtparam=i2c_arm=on
	dtoverlay=w1-gpio
```
### Install Apache Web Server 
![SentryPi Dashboard](/images/example-dashboard.png)

The Apache web server with PHP support will be used for a local network control panel.

```bash
sudo apt-get install apache2 -y
sudo apt-get install php5 libapache2-mod-php5 -y
sudo sed -i 's/short_open_tag\ =\ Off/short_open_tag\ =\ On/g' /etc/php5/apache2/php.ini
```

### Set up RAMDISK for Temp Storage 
Set up a temporary file system that the SentryPi panel can use for storage:
```bash
sudo mkdir /var/www-tmp
sudo chown www-data:adm /var/www-tmp
sudo chmod g+w /var/www-tmp
sudo chown -R pi /var/www/html
mkdir ~/iot
ln -s /var/www/html ~/iot/www
```
Ideally you want to change /var/www-tmp to be a ramdisk to prevent SD burnout. Add this to /etc/fstab:

`tmpfs /var/www-tmp  tmpfs defaults,noatime 0 0`

### Python Libs and Tools
The SentryPi scripts are written in python.  These packages allow the building and installation of additional python modules.
```bash
sudo apt-get install git python-dev python-pip
git clone https://github.com/adafruit/Adafruit_Python_BMP.git
sudo python setup.py install
```

## Amazon Web Services 
Register the Raspberry Pi as an AWS IoT device.
Follow the directions at http://docs.aws.amazon.com/iot/latest/developerguide/iot-sdk-setup.html to:
* Create and Attach a Thing (Device)
* Generate certificates and policy
* Download certificates

Once all the certificates (i.e. device certificate, private key, and root CA certificate) are downloaded from AWS, copy them to the ~/iot/certs folder.

Create an IoT rule to push data into DynamoDB:
http://docs.aws.amazon.com/iot/latest/developerguide/iot-ddb-rule.html

### Install Library for AWS Services used by SentryPi: IoT, SQS, SNS, DynamoDB
```python
pip install boto3
```

#  SentryPi Modules
* Copy these scripts to ~/iot
* Most of the scripts produce JSON output that can be sent to AWS IoT & DynamoDB for creating dashboards, graphs and other functions.  The following example script can be set up via cron to poll and record state:
```bash
# Poll Sensor Probe and Record state
TD=`sudo python /home/pi/iot/sentrypi-temp.py`
# Record Result 
curl -s --cacert /home/pi/iot/certs/root-CA.crt \
   --cert /home/pi/iot/certs/----------.cert.pem \
   --key /home/pi/iot/certs/----------.private.key -X POST -d "$TD" \
   "https://-------------.iot.us-east-1.amazonaws.com:8443/topics/sentryPi/sensor?qos=1" > /dev/null
```
(replace file and URL with your AWS specific values)

Some of the scripts also include logic to send alerts via AWS SNS (simple notification service).  For my application, I set up a distribution group to send SMS texts to my family. To set these up, edit these scripts to include your AWS SNS topic details, example:

```
# Create an SNS client for alerts
client = boto3.client(
    "sns",
    aws_access_key_id="--------------------",
    aws_secret_access_key="----------------------------------------",
    region_name="us-east-1")
SNSTopicArn = "arn:aws:sns:us-east-1:------------:SentryPiAlerts"
```

## Door Sensor (Generic Switch Sensor)
![Door Graph](/images/example-doorgraph.png)
* [sentrypi-door.py](sentrypi-door.py) - Report on micro-switch state open/close (JSON output)
This scripts looks for an open/close condition on a switch. 

## DHT11 Humidity and Temperature Sensor 
![DHT11 Humidity Graph](/images/example-humidity.png)
* [sentrypi-temp.py](sentrypi-temp.py) & [dht11.py](dht11.py)
The DHT11 sensor reads both humidity and temperature data.  It requires the DHT11 python library.  The temperature data is low resolution and not very accurate, but the humidity data is accurate enough for trending. 

Update: This script has been updated to use a DS18B20 probe for temperature and the DHT11 for humidity.

## BMP180 / BMP085 Barometric Sensor 
![BMP180 Barometric Graph](/images/example-barometric.png)
* [sentrypi-bmp180.py](sentrypi-bmp180.py) - BMP180 / BMP085 barometric probe (JSON output)
This sensor uses the Adafruit_BMP.BMP085 library:
```bash
git clone https://github.com/adafruit/Adafruit_Python_BMP.git
sudo python setup.py install
```

## RPi CPU Sensor
![RPi CPU Graph](/images/example-cpu.png)
* [sentrypi-cpu.py](sentrypi-cpu.py) - RPi CPU and GPU temp and load (JSON output)
This script reads the RPi CPU/GPU temperature and load.  

## Temperature Sensor - DS18B20 1-Wire Probe
![Temp Graph](/images/example-outsidetemp.png)
* [sentrypi-w1-temp.py](sentrypi-w1-temp.py) - 1-Wire (w1-gpio) Probe - Report on Temp (JSON output) 
This script reads the value of the DS18B20 1-Wire probe.  Each probe has a unique identifier and once attached, it will be registered in the `/sys/bus/w1/devices/` directory.  Look for identifiers with a "28-" prefix.  Update the script with the probe ID you want to use.

Note: The 1-Wire sensors are designed to be on a signal bus.  There are actually 3 wires: power, ground and signal.  You should always extend to the next probe from the last one instead of going back to the RPi (do not use star topology):

![1-Wire Diagram](/images/1-wire.png)

* DS18b20 Waterproof Temperature Sensors Temperature Transmitter [Amazon](https://www.amazon.com/gp/product/B00CHEZ250/ref=oh_aui_search_detailpage?ie=UTF8&psc=1)

## Freezer Sensor - DS18B20 1-Wire Probe
![Freezer Temp Graph](/images/example-freezer.png)
* [sentrypi-freezer.py](sentrypi-freezer.py) - 1-Wire (w1-gpio) Probe - Report on Freezer Temp and send Alerts based on defined thresholds
This script reads the value of the DS18B20 1-Wire probe located inside a freezer. It has logic int he script to send out alerts based on temperature warning (default 14'F) and thaw alert (default 32'F).  

Note: This is a wired sensor so it require careful routing of the wire inside a freezer door so that you do not break the seal.

## Door Monitoring Services
* [sentrypi-service.py](sentrypi-service.py) - Service to monitor door state, illuminate LED indicator when open and alert via SNS if it exceeds threshold.
This script is set up as service to monitor a switch state to indicate door open or close. Once the door is open, it activates an LED indicator and begins a counter.  Once the counter reaches an alert threshold (default: 10 minutes) it will send out alerts via AWS SNS.
e
* Description: The sentrypi-service.py monitors for door open state and alerts via SNS if it exceeds time limit.  The service also records motion if a motion detector is installed.
* How to set up a script as a service: http://www.diegoacuna.me/how-to-run-a-script-as-a-service-in-raspberry-pi-raspbian-jessie/

```bash
sudo cp sentrypi.service  /lib/systemd/system/
sudo chmod 644 /lib/systemd/system/sentrypi.service
sudo chmod +x /home/pi/iot/sentrypi-service.py
sudo systemctl daemon-reload
sudo systemctl enable sentrypi.service
sudo systemctl start sentrypi.service

# Check status
sudo systemctl status sentrypi.service
 
# Check service's log
sudo journalctl -f -u sentrypi.service
```

## Website Monitor
* [sentrypi-website.py](sentrypi-website.py) - Checks to see if a website is running and records the time (ms) to download the URL. Additionally, this script will send SNS messages if the site is down for 2 consecutive tries.


## WiFi Who's There?
* [sentrypi-wifi-who.py](sentrypi-wifi-who.py) - Scan WiFi for MAC Addresses (JSON output)

## Utility Scripts
* [heartbeat.py](heartbeat.py) - flash LED (set up as cron)
* [watchdog.sh](watchdog.sh) - Monitors connectivity and reboots RPi if gateway disappears (set up as cron)
* [utils.py](utils.py) - Utility functions used by several scripts

## Website Dashboard and Graphs
* [web/](web/) - Folder contains example HTML and Js to pull data from DynamoDB

