#!/bin/bash

# Any subsequent(*) commands which fail will cause the shell script to exit immediately
set -e

THIS_NAME="$(basename "${0}")"
THIS_PATH="$(readlink -e "${0}")"
THIS_DIR="$(dirname "${THIS_PATH}")"
DIR_ROOT="$(dirname "${THIS_DIR}")"

##
## CHECK PREREQUISITES
##

if [ -z "$DOCKER_USERNAME" ]; then
    echo "You need to set the DOCKER_USERNAME environment variable in order to pull the Gitlab registry container"
    exit 1
fi

if [ -z "$DOCKER_PASSWORD" ]; then
    echo "You need to set the DOCKER_PASSWORD environment variable in order to pull the Gitlab registry container"
    exit 1
fi

if [ -z "$HOME" ]; then
    echo "You need to set the HOME environment variable"
    exit 1
fi

if ! which jq > /dev/null; then
   echo "jq cli was not found. Please install it, e.g. with 'apt-get install jq'"
   exit 1
fi

CONFIG_DIR="$HOME/$(jq -r .config_dir $DIR_ROOT/config.json)"
ASSETS_DIR="$CONFIG_DIR/$(jq -r .assets_sub_dir $DIR_ROOT/config.json)"
DOCKER_REGISTRY="registry.gitlab.com"

mkdir -p $ASSETS_DIR

# fetch all assets from S3
bash $THIS_DIR/s3-fetch.sh $ASSETS_DIR

# pull magic-mirror-photobooth docker image 
docker login -u $DOCKER_USERNAME -p $DOCKER_PASSWORD $DOCKER_REGISTRY
docker pull $DOCKER_REGISTRY/d.dentsas/magic-mirror-photobooth:latest
docker logout $DOCKER_REGISTRY

# run the magic-mirror-photobooth container
bash $THIS_DIR/docker-run.sh