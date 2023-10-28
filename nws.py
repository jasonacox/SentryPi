#!/usr/bin/python

# National Weather Service - Alerts
#
# Send SMS Message based on Weather Service Alerts
# Required: AWS Account and SNS setup

import requests
import os
import json
import boto3

LAT = "35.000000"    # Latitude
LON = "-115.000000"  # Longitude
NWS_URL = "https://api.weather.gov/alerts/active?point=%s,%s" % (LAT,LON)
NWS_FILE = "/tmp/nws-alert" # File to store last alert

# Create an SNS client for alerts - Fill in your key values
REGION = "us-east-1"
client = boto3.client(
    "sns",
    aws_access_key_id="key_id",
    aws_secret_access_key="key_secret",
    region_name=REGION)
SNSTopicArn = "arn:aws:sns:%s:nws" % REGION 

# Check National Weather Service for Alerts in our Area
r = requests.get(NWS_URL)
data = json.loads(r.text)
nws = {}
alert = ""
idx = 0
nidx = 0
update = False
# New Alerts
try:
    for i in data['features']:
        if i['properties']['messageType'] in ["Alert", "Update"]:
            alert = i['properties']['headline']
            print("Alert %d: %s!\n\n" % (idx, alert))
            nws["alert"] = alert
            if i['properties']['messageType'] == "Update":
                update = True
                nws["updated"] = True
        idx = idx + 1
except:
    idx = 0

print ("Alerts [%d]: %s" % (idx, alert))

if idx > 0:
    print ("Alerts [%d]" % idx)
    if not os.path.exists(NWS_FILE):
        # Send Text about New Alert
        client.publish(
            Message="%s" % (alert),
            TopicArn="%s" % SNSTopicArn)
    with open(NWS_FILE, 'w') as f:
        json.dump(nws, f)

if idx + nidx == 0:
    print ("No Alerts")
    os.unlink(NWS_FILE)

