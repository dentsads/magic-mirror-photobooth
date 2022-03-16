#!/bin/bash

sudo -E docker-slim build \
--label autoheal=true \
--env PHOTOBOOTH_CAMERA_MOCK=1 \
--env PHOTOBOOTH_PRINTER_MOCK=1 \
--mount $HOME/.magic-mirror-photobooth/assets:/root/.magic-mirror-photobooth/assets \
--mount $HOME/.magic-mirror-photobooth/photos:/root/.magic-mirror-photobooth/photos \
--mount $HOME/.magic-mirror-photobooth/events:/root/magic-mirror-photobooth/events \
--mount $HOME/.magic-mirror-photobooth/config.json:/root/magic-mirror-photobooth/built/config.json \
--mount $HOME/.magic-mirror-photobooth/config.json:/root/magic-mirror-photobooth/config.json \
--mount $HOME/.magic-mirror-photobooth/logs:/root/magic-mirror-photobooth/logs \
--mount /run/udev:/run/udev:ro \
--mount /var/run/dbus:/var/run/dbus \
--mount /dev/bus/usb:/dev/bus/usb \
--cmd ./startup.sh \
--expose 4200 \
--expose 631 \
--http-probe-retry-wait 30 \
--show-clogs=true \
--show-blogs=true \
--target magic-mirror-photobooth \
--exec "pm2 ls"

