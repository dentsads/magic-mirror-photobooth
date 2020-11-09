#!/bin/bash

if [ -z "$AWS_ACCESS_KEY" ]; then
    echo "You need to set the AWS_ACCESS_KEY environment variable for the AWS access token"
    exit 1
fi

if [ -z "$AWS_SECRET_KEY" ]; then
    echo "You need to set the AWS_SECRET_KEY environment variable for the AWS secret token"
    exit 1
fi

sudo -E docker run -d \
--restart unless-stopped \
--env AWS_ACCESS_KEY=$AWS_ACCESS_KEY \
--env AWS_SECRET_KEY=$AWS_SECRET_KEY \
--name magic-mirror-photobooth-qr \
-v $HOME/.magic-mirror-photobooth/assets:/root/.magic-mirror-photobooth/assets \
-v $HOME/.magic-mirror-photobooth/photos:/root/.magic-mirror-photobooth/photos \
-v $HOME/.magic-mirror-photobooth/events:/root/magic-mirror-photobooth/events \
-v $HOME/.magic-mirror-photobooth/config.json:/root/magic-mirror-photobooth/config.json \
magic-mirror-photobooth-qr