#!/bin/bash

THIS_NAME="$(basename "${0}")"
THIS_PATH="$(readlink -e "${0}")"
THIS_DIR="$(dirname "${THIS_PATH}")"
DIR_ROOT="$(dirname "${THIS_DIR}")"
EVENT_DIR="$DIR_ROOT/events"

# create an 8-digit alphanumeric strign representing the event id
EVENT_ID=$(cat /dev/urandom | tr -dc 'a-zA-Z1-9' | fold -w 8 | head -n 1)

mkdir $EVENT_DIR/$EVENT_ID

cat << EOF > $EVENT_DIR/$EVENT_ID/metadata.json
{
    "event_id": "$EVENT_ID",
    "description": "",
    "creation_date": "$(date --iso-8601=seconds)"
}
EOF