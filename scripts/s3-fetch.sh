#!/bin/bash

THIS_NAME="$(basename "${0}")"

fnUsage() {
	local msg="$1"

	if [ -n "$msg" ] ; then
		echo
		echo "$msg"
	fi

	fnExit 1 "Usage: ${THIS_NAME} <DESTINATION_FOLDER_PATH>"
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
    echo "Need to set the AWS_ACCESS_KEY environment variable for the AWS access token"
    exit 1
fi

if [ -z "$AWS_SECRET_KEY" ]; then
    echo "Need to set the AWS_SECRET_KEY environment variable for the AWS secret token"
    exit 1
fi

S3BUCKET="magic-mirror-photobooth-assets"
DESTINATION_FOLDER_PATH="$1"

echo 'Fetching magic-mirror-photobooth asset files from S3 bucket'
s3cmd get s3://$S3BUCKET/ --access_key=$AWS_ACCESS_KEY --secret_key=$AWS_SECRET_KEY --no-ssl -P --no-mime-magic --skip-existing -r $DESTINATION_FOLDER_PATH && echo "Fetching was successful"

exit $?