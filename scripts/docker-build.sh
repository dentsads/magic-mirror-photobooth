#!/bin/bash

THIS_NAME="$(basename "${0}")"
THIS_PATH="$(readlink -e "${0}")"
THIS_DIR="$(dirname "${THIS_PATH}")"
DIR_ROOT="$(dirname "${THIS_DIR}")"

sudo docker build --no-cache -t magic-mirror-photobooth $DIR_ROOT