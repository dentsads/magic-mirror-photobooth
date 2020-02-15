#!/bin/bash

THIS_NAME="$(basename "${0}")"

fnUsage() {
	local msg="$1"

	if [ -n "$msg" ] ; then
		echo
		echo "$msg"
	fi

	fnExit 1 "Usage: ${THIS_NAME} <FILE>"
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

[ $# -lt 1 ] && fnUsage

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

S3BUCKET="dentsads-public"
S3PREFIX="magic-mirror-photobooth/scripts"
FILE="$1"

echo 'Fetching magic-mirror-photobooth asset files from S3 bucket'
s3cmd put $FILE s3://$S3BUCKET/$S3PREFIX/ --access_key=$AWS_ACCESS_KEY --secret_key=$AWS_SECRET_KEY --no-ssl -P && echo "Pushing was successful"

exit $?