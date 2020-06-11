#!/bin/bash

# Script to install the magic-mirror-photobooth Software
# on the Ubuntu host machine
#
# Run like this:
#
# curl -sL https://dentsads-public.s3.eu-central-1.amazonaws.com/magic-mirror-photobooth/scripts/install.sh | sudo -E bash -
#   or
# wget -qO- https://dentsads-public.s3.eu-central-1.amazonaws.com/magic-mirror-photobooth/scripts/install.sh | sudo -E bash -
#
# Copyright 2020 Dimitrios Dentsas

print_status() {
    echo
    echo -e "##  ${bold}${green}$1${normal}"
    echo
}

if test -t 1; then # if terminal
    ncolors=$(which tput > /dev/null && tput colors) # supports color
    if test -n "$ncolors" && test $ncolors -ge 8; then
        termcols=$(tput cols)
        bold="$(tput bold)"
        underline="$(tput smul)"
        standout="$(tput smso)"
        normal="$(tput sgr0)"
        black="$(tput setaf 0)"
        red="$(tput setaf 1)"
        green="$(tput setaf 2)"
        yellow="$(tput setaf 3)"
        blue="$(tput setaf 4)"
        magenta="$(tput setaf 5)"
        cyan="$(tput setaf 6)"
        white="$(tput setaf 7)"
    fi
fi

print_bold() {
    title="$1"
    text="$2"

    echo
    echo "${cyan}================================================================================${normal}"
    echo "${cyan}================================================================================${normal}"
    echo
    echo -e "  ${bold}${green}${title}${normal}"
    echo
    echo -en "  ${text}"
    echo
    echo "${cyan}================================================================================${normal}"
    echo "${cyan}================================================================================${normal}"
}

bail() {
    echo 'Error executing command, exiting'
    exit 1
}

exec_cmd_nobail() {
    echo "+ $1"
    bash -c "$1"
}

exec_cmd() {
    exec_cmd_nobail "$1" || bail
}

sudo_exec_cmd_nobail() {
    echo "+ $1"
    sudo bash -c "$1"
}

sudo_exec_cmd() {
    sudo_exec_cmd_nobail "$1" || bail
}

exec_cmd_no_sudo_nobail() {
    echo "+ $1"
    sudo -u ${SUDO_USER} bash -c "$1"
}

exec_cmd_no_sudo() {
    exec_cmd_no_sudo_nobail "$1" || bail
}


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

if [ -z "$AWS_ACCESS_KEY" ]; then
    echo "You need to set the AWS_ACCESS_KEY environment variable for the AWS access token"
    exit 1
fi

if [ -z "$AWS_SECRET_KEY" ]; then
    echo "You need to set the AWS_SECRET_KEY environment variable for the AWS secret token"
    exit 1
fi

if [ -z "$HOME" ]; then
    echo "You need to set the HOME environment variable"
    exit 1
fi

if ! which docker > /dev/null; then
   echo "docker was not found. Please install it. See here: https://docs.docker.com/install/linux/docker-ce/ubuntu/"
   exit 1
fi

if ! which jq > /dev/null; then
   echo "jq cli was not found. Please install it, e.g. with 'apt-get install jq'"
   exit 1
fi

if ! which s3cmd > /dev/null; then
   echo "s3cmd was not found. Please install it. See here: https://s3tools.org/download"
   exit 1
fi

print_bold "INSTALLING SOFTWARE" "\

Installing magic-mirror-photobooth Software on Ubuntu host machine...

 |  \/  |           (_)      |  \/  (_)                    
 | \  / | __ _  __ _ _  ___  | \  / |_ _ __ _ __ ___  _ __ 
 | |\/| |/ _` |/ _` | |/ __| | |\/| | | '__| '__/ _ \| '__|
 | |  | | (_| | (_| | | (__  | |  | | | |  | | | (_) | |   
 |_|  |_|\__,_|\__, |_|\___| |_|  |_|_|_|  |_|  \___/|_|   
                __/ |                                      
               |___/ 
"
sleep 1

CONFIG_DIR="$HOME/.magic-mirror-photobooth"
ASSETS_DIR="$CONFIG_DIR/assets"
PHOTOS_DIR="$CONFIG_DIR/photos"
EVENTS_DIR="$CONFIG_DIR/events"
LOGS_DIR="$CONFIG_DIR/logs"
DOCKER_REGISTRY="registry.gitlab.com"
S3BUCKET="magic-mirror-photobooth-assets"
S3OBJECT="rendered-assets"

print_status "Creating asset directory $ASSETS_DIR..."
exec_cmd_no_sudo "mkdir -p $ASSETS_DIR"

print_status "Fetching assets from S3 bucket $S3BUCKET..."
exec_cmd_no_sudo "s3cmd get s3://$S3BUCKET/$S3OBJECT/ --access_key=\"$AWS_ACCESS_KEY\" --secret_key=\"$AWS_SECRET_KEY\" --no-ssl -P --no-mime-magic --skip-existing -r $ASSETS_DIR"

print_status "pull magic-mirror-photobooth docker image from $DOCKER_REGISTRY..."
exec_cmd "docker login -u $DOCKER_USERNAME -p $DOCKER_PASSWORD $DOCKER_REGISTRY"
exec_cmd "docker pull $DOCKER_REGISTRY/magic-mirror-photobooth/magic-mirror-photobooth:latest"
exec_cmd "docker logout $DOCKER_REGISTRY"
exec_cmd "docker tag $DOCKER_REGISTRY/magic-mirror-photobooth/magic-mirror-photobooth magic-mirror-photobooth"

print_status "run the magic-mirror-photobooth container..."
sudo -E docker run -d \
--restart unless-stopped \
--privileged \
--label autoheal=true \
--name magic-mirror-photobooth \
-v $ASSETS_DIR:/root/.magic-mirror-photobooth/assets \
-v $PHOTOS_DIR:/root/.magic-mirror-photobooth/photos \
-v $EVENTS_DIR:/root/magic-mirror-photobooth/events \
-v $CONFIG_DIR/config.json:/root/magic-mirror-photobooth/built/config.json \
-v $LOGS_DIR:/root/magic-mirror-photobooth/logs \
-v /run/udev:/run/udev:ro \
-v /var/run/dbus:/var/run/dbus \
-v /dev/bus/usb:/dev/bus/usb \
-p :4200:4200 \
-p :632:631 \
magic-mirror-photobooth