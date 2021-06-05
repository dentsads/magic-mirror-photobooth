#!/bin/bash

# start cups
/usr/sbin/cupsd -c  /etc/cups/cupsd.conf

# start pm2
pm2-runtime docker.pm2.ecosystem.config.js