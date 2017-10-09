# SentryPi
Tools to help build a home monitoring platform using a Raspberry Pi

## Setup Basics

The following will help you set up your Raspbery Pi as a platform to install the SentryPi scripts.

Required: 
* Raspberry Pi - B+, 2 or 3
* Wifi Dongle or Network Cable configured 
* SD card (Recommend: 16GB or larger)
* AWS Account (IoT, DynamoDB)

### Rasperian 
Install the Raspberry Pi operating system onto an SD card.  
https://www.raspberrypi.org/documentation/installation/installing-images/

Boot the Raspbery Pi and update Rasperian packages:
```
sudo apt-get update
sudo apt-get upgrade -y
````

### Activate i2c and w1 Interfaces
`sudo raspi-config`	
`sudo vi /boot/config.txt`
	dtparam=i2c_arm=on
	dtoverlay=w1-gpio

### Install Apache Web Server
The apache web server with PHP support will be used for a local network control panel.
```
sudo apt-get install apache2 -y
sudo apt-get install php5 libapache2-mod-php5 -y
sudo sed -i 's/short_open_tag\ =\ Off/short_open_tag\ =\ On/g' /etc/php5/apache2/php.ini
```
Set up a temporary file system that the SentryPi panel can use for storage:
```
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
```
sudo apt-get install python-dev
sudo apt-get install python-pip
git clone https://github.com/adafruit/Adafruit_Python_BMP.git
sudo python setup.py install
```

## Amazon Web Services 
Register the Raspberry Pi as an AWS IoT device.
* http://docs.aws.amazon.com/iot/latest/developerguide/iot-sdk-setup.html
* Copy cert pem and keys to ~/iot/certs folder.

### Install Library for AWS Services used by SentryPi: IoT, SQS, SNS, DynamoDB
```
pip install boto3
```

##  Install SentryPi Files
* Copy files to ~/iot

## Make SentryPi a Services
* Description: The sentrypi-service.py monitors for door open state and alerts vis SNS if it exceeds time limit.  The service also records motion if a motion detector is installed.
* How to set up a script as a service: http://www.diegoacuna.me/how-to-run-a-script-as-a-service-in-raspberry-pi-raspbian-jessie/

```
sudo cp sentrypi.service  /lib/systemd/system/
sudo chmod 644 /lib/systemd/system/sentrypi.service
sudo chmod +x /home/pi/iot/sentrypi-service.py
sudo systemctl daemon-reload
sudo systemctl enable sentrypi.service
sudo systemctl start sentrypi.service
```

* Check status
sudo systemctl status sentrypi.service
 
* Check service's log
sudo journalctl -f -u sentrypi.service
