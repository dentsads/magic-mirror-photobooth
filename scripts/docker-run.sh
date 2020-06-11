#!/bin/bash

sudo -E docker run -d \
--restart unless-stopped \
--privileged \
--label autoheal=true \
--name magic-mirror-photobooth \
-v $HOME/.magic-mirror-photobooth/assets:/root/.magic-mirror-photobooth/assets \
-v $HOME/.magic-mirror-photobooth/photos:/root/.magic-mirror-photobooth/photos \
-v $HOME/.magic-mirror-photobooth/events:/root/magic-mirror-photobooth/events \
-v $HOME/.magic-mirror-photobooth/config.json:/root/magic-mirror-photobooth/built/config.json \
-v $HOME/.magic-mirror-photobooth/config.json:/root/magic-mirror-photobooth/config.json \
-v $HOME/.magic-mirror-photobooth/logs:/root/magic-mirror-photobooth/logs \
-v /run/udev:/run/udev:ro \
-v /var/run/dbus:/var/run/dbus \
-v /dev/bus/usb:/dev/bus/usb \
-p :4200:4200 \
-p :632:631 \
magic-mirror-photobooth