#!/bin/bash
/usr/sbin/cupsd -f -c  /etc/cups/cupsd.conf &
pm2-runtime docker.pm2.ecosystem.config.js