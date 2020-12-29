#!/bin/bash

# if the script parameter -m or --mock is passed, then set and start the container in mock mode
while test $# -ge 0; do
  case "$1" in
    -m|--mock)
      echo "Starting container in mock mode"
      IS_MOCK_MODE=1
      break
      ;;    
    *)
      echo "Starting container in production mode"
      IS_MOCK_MODE=0
      break
      ;;
  esac
done

sudo -E docker run -d \
--restart unless-stopped \
--privileged \
--label autoheal=true \
--env PHOTOBOOTH_CAMERA_MOCK=$IS_MOCK_MODE \
--env PHOTOBOOTH_PRINTER_MOCK=$IS_MOCK_MODE \
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


# This is a crazy hack in order to enable the mouse cursor in the browser while in mock mode, since it is disabled in production mode
if [[ "$IS_MOCK_MODE" == "1" ]] ; then
  sudo docker exec -it magic-mirror-photobooth sed -ie 's/cursor.*/cursor: auto;/g' src/production.styles.css
fi