#!/bin/bash

PRINTER_NAME=$1

# start cups
/usr/sbin/cupsd -c  /etc/cups/cupsd.conf

# register printer
lpadmin \
-p $PRINTER_NAME \
-o PageSize=w288h432 \
-o StpColorCorrection=Raw \
-o StpColorPrecision=Best \
-o StpImageType=Photo \
-o 'printer-is-shared=false' \
-E \
-m "$(lpinfo -m | grep -i $PRINTER_NAME | awk '{print $1}' | tail -1)" \
-v "$(lpinfo -v | grep -i "direct gutenprint53" | tail -1 | awk '{print $2}')"

# start pm2
pm2-runtime docker.pm2.ecosystem.config.js