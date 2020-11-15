#!/bin/bash

##
## CHECK PREREQUISITES
##

if [ -z "$DOCKER_USERNAME" ]; then
    echo "You need to set the DOCKER_USERNAME environment variable in order to push to the Gitlab registry"
    exit 1
fi

if [ -z "$DOCKER_PASSWORD" ]; then
    echo "You need to set the DOCKER_PASSWORD environment variable in order to push to the Gitlab registry"
    exit 1
fi

DOCKER_REGISTRY="registry.gitlab.com"

sudo -E docker login -u "$DOCKER_USERNAME" -p "$DOCKER_PASSWORD" $DOCKER_REGISTRY

# push the magic-mirror-photobooth-upload image
sudo -E docker tag magic-mirror-photobooth-upload $DOCKER_REGISTRY/magic-mirror-photobooth/magic-mirror-photobooth/magic-mirror-photobooth-upload
sudo -E docker push $DOCKER_REGISTRY/magic-mirror-photobooth/magic-mirror-photobooth/magic-mirror-photobooth-upload:latest