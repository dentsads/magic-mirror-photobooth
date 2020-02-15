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

docker login -u $DOCKER_USERNAME -p $DOCKER_PASSWORD $DOCKER_REGISTRY
docker tag magic-mirror-photobooth $DOCKER_REGISTRY/d.dentsas/magic-mirror-photobooth
docker push $DOCKER_REGISTRY/d.dentsas/magic-mirror-photobooth:latest
