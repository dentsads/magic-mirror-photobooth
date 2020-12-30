#!/bin/bash

# Script to install the magic-mirror-photobooth Software
# on the Ubuntu host machine
#
# Run like this:
#
# curl -sL https://dentsads-public.s3.eu-central-1.amazonaws.com/magic-mirror-photobooth/scripts/install.sh | sudo -E -u $USER bash -
#   or
# wget -qO- https://dentsads-public.s3.eu-central-1.amazonaws.com/magic-mirror-photobooth/scripts/install.sh | sudo -E -u $USER bash -
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

if [ -z "$DISCORD_WEBHOOK" ]; then
    echo "You need to set the DISCORD_WEBHOOK environment variable"
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

if ! which curl > /dev/null; then
   echo "curl was not found. Please install it, e.g. with 'apt-get install curl'"
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
MONITORING_REPO_PATH="/tmp/magic-mirror-photobooth-monitoring"
MONITORING_REPO_VERSION="v0.3"

print_status "Creating asset directory $ASSETS_DIR..."
exec_cmd_no_sudo "mkdir -p $ASSETS_DIR"

print_status "Creating events directory $EVENTS_DIR..."
exec_cmd_no_sudo "mkdir -p $EVENTS_DIR"

print_status "Fetching assets from S3 bucket $S3BUCKET..."
exec_cmd_no_sudo "s3cmd sync s3://$S3BUCKET/rendered-assets/ "$ASSETS_DIR/" --access_key=\"$AWS_ACCESS_KEY\" --secret_key=\"$AWS_SECRET_KEY\" --no-ssl --no-mime-magic"

print_status "Fetching event files from S3 bucket $S3BUCKET..."
exec_cmd_no_sudo "s3cmd sync s3://$S3BUCKET/events/ "$EVENTS_DIR/" --access_key=\"$AWS_ACCESS_KEY\" --secret_key=\"$AWS_SECRET_KEY\" --no-ssl --no-mime-magic"

print_status "Add current user ${USER} to docker group..."
exec_cmd "groupadd docker -f"
sudo_exec_cmd_nobail "usermod -aG docker ${USER}"

print_status "Log into docker group and switch back to original group in order to apply group changes without logout/login..."
# todo: fix this, since otherwise on fresh installations the electron frontend won't be able to restart docker until the machine was rebooted once
# exec_cmd_no_sudo 'exec sg docker "newgrp `id -gn`"' 
sudo_exec_cmd_nobail "chown ${USER}:${USER} /home/${USER}/.docker -R"
sudo_exec_cmd_nobail "chmod g+rwx /home/${USER}/.docker -R"

print_status "Install electron frontend app .deb file, if it is not already installed..."
sudo_exec_cmd_nobail 'dpkg -s electron-frontend-app 1>/dev/null 2>/dev/null'
if [ $? -ne 0 ]; then
    export TEMP_DEB=$(mktemp)
    exec_cmd "wget -O $TEMP_DEB 'https://dentsads-public.s3.eu-central-1.amazonaws.com/magic-mirror-photobooth/electron-frontend-app/electron-frontend-app_1.0.0_amd64.deb'"
    sudo_exec_cmd_nobail "dpkg -i $TEMP_DEB"
    exec_cmd "rm -f $TEMP_DEB"
else
    print_status "electron frontend app already exists. You can purge it first with 'dpkg --purge electron-frontend-app'"
fi

print_status "pull magic-mirror-photobooth docker image from $DOCKER_REGISTRY..."
exec_cmd "docker login -u $DOCKER_USERNAME -p $DOCKER_PASSWORD $DOCKER_REGISTRY"
exec_cmd "docker pull $DOCKER_REGISTRY/magic-mirror-photobooth/magic-mirror-photobooth/magic-mirror-photobooth:latest"
exec_cmd "docker pull $DOCKER_REGISTRY/magic-mirror-photobooth/magic-mirror-photobooth/magic-mirror-photobooth-upload:latest"
exec_cmd "docker logout $DOCKER_REGISTRY"
exec_cmd "docker tag $DOCKER_REGISTRY/magic-mirror-photobooth/magic-mirror-photobooth/magic-mirror-photobooth magic-mirror-photobooth"
exec_cmd "docker tag $DOCKER_REGISTRY/magic-mirror-photobooth/magic-mirror-photobooth/magic-mirror-photobooth-upload magic-mirror-photobooth-upload"

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
-v $CONFIG_DIR/config.json:/root/magic-mirror-photobooth/config.json \
-v $LOGS_DIR:/root/magic-mirror-photobooth/logs \
-v /run/udev:/run/udev:ro \
-v /var/run/dbus:/var/run/dbus \
-v /dev/bus/usb:/dev/bus/usb \
-p :4200:4200 \
-p :632:631 \
magic-mirror-photobooth

print_status "run the magic-mirror-photobooth-upload container..."
sudo -E docker run -d \
--restart unless-stopped \
--env AWS_ACCESS_KEY=$AWS_ACCESS_KEY \
--env AWS_SECRET_KEY=$AWS_SECRET_KEY \
--name magic-mirror-photobooth-upload \
-v $CONFIG_DIR:/root/.magic-mirror-photobooth/ \
magic-mirror-photobooth-upload


print_status "download and extract magic-mirror-photobooth-monitoring repository .zip from Gitlab..."
exec_cmd "curl -s  --header 'PRIVATE-TOKEN: $DOCKER_PASSWORD' 'https://gitlab.com/api/v4/projects/23382176/repository/archive.tar.gz?sha=$MONITORING_REPO_VERSION' -o /tmp/archive.tar.gz"
exec_cmd "mkdir -p $MONITORING_REPO_PATH"
exec_cmd "tar -xzvf /tmp/archive.tar.gz -C $MONITORING_REPO_PATH --strip-components 1"
exec_cmd "echo 'DISCORD_WEBHOOK=$DISCORD_WEBHOOK' > $MONITORING_REPO_PATH/.env"

print_status "start up monitoring with 'docker-compose up -d'"
sudo_exec_cmd "docker-compose -f $MONITORING_REPO_PATH/docker-compose.yml up -d"