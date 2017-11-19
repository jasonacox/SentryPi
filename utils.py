#!/usr/bin/python
#
# SentryPi - Utility Functions
#
# Jason A. Cox, @jasonacox
#   https://github.com/jasonacox/SentryPI


# sectext - Convert Seconds into days, hours, minutes and seconds
def sectext(seconds):
    minutes, seconds = divmod(seconds, 60)
    hours, minutes = divmod(minutes, 60)
    days, hours = divmod(hours, 24)

    result = ""
    if (days > 0):
        result = "%dd " % days
    if (hours > 0):
        result = result + "%dh " % hours
    if (minutes > 0):
        result = result + "%dm " % minutes
    if ((seconds > 0) or (result == "")):
        result = result + "%ds " % seconds

    return result
