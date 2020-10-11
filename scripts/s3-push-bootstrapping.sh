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

if ! which aws > /dev/null; then
   echo "aws cli was not found. Please install it from here: https://aws.amazon.com/cli/?nc1=h_ls"
   exit 1
fi

S3BUCKET="dentsads-public"
S3PREFIX="magic-mirror-photobooth/scripts"
FILE="$1"

echo 'Putting magic-mirror-photobooth asset files to S3 bucket'
aws s3 cp $FILE "s3://$S3BUCKET/$S3PREFIX/" --acl public-read && echo "Pushing was successful"

exit $?