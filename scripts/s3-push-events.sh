#!/bin/bash

THIS_NAME="$(basename "${0}")"
THIS_PATH="$(readlink -e "${0}")"
THIS_DIR="$(dirname "${THIS_PATH}")"
DIR_ROOT="$(dirname "${THIS_DIR}")"

fnUsage() {
	local msg="$1"

	if [ -n "$msg" ] ; then
		echo
		echo "$msg"
	fi

	fnExit 1 "Usage: ${THIS_NAME}"
}

fnExit() {
	local exitVal="$1"
	local exitMsg="$2"

	## exit
	[ -z "$exitVal" ] && exitVal=1

	if [ -n "$exitMsg" ] ; then
		echo
		echo "$exitMsg"
		echo
	fi

	exit $exitVal
}

##
## CHECK PREREQUISITES
##

if ! which s3cmd > /dev/null; then
   echo "s3cmd package was not found. Please install it from here: https://s3tools.org/download"
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

S3BUCKET="magic-mirror-photobooth-assets"
S3PREFIX="events"
EVENT_DIR="$DIR_ROOT/events"

echo 'Putting magic-mirror-photobooth asset files to S3 bucket'
s3cmd sync "$EVENT_DIR/" "s3://$S3BUCKET/$S3PREFIX/" --no-mime-magic && echo "Pushing was successful"

exit $?