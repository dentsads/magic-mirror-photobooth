#!/bin/bash

set -e # Any subsequent(*) commands which fail will cause the shell script to exit immediately

THIS_NAME="$(basename "${0}")"
THIS_PATH="$(readlink -e "${0}")"
THIS_DIR="$(dirname "${THIS_PATH}")"
DIR_ROOT="$(dirname "${THIS_DIR}")"

print_status() {
    echo
    echo -e "${bold}${green}$1${normal}"
    echo
}

print_status_red() {
    echo
    echo -e "${bold}${red}$1${normal}"
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

fnExit() {
	local exitVal="$1"
	local exitMsg="$2"

	## exit
	[ -z "$exitVal" ] && exitVal=1

	if [ -n "$exitMsg" ] ; then
		print_status_red "$exitMsg"
	fi

	exit $exitVal
}

fnUsage() {
	local msg="$1"

	if [ -n "$msg" ] ; then
		echo
		echo "$msg"
	fi

	fnExit 1 "Usage: ${THIS_NAME} <EVENT_ID>"
}

##
## CHECK PREREQUISITES
##

[ $# -lt 1 ] && fnUsage

if [ -z "$AWS_ACCESS_KEY" ]; then
    fnExit 1 "You need to set the AWS_ACCESS_KEY environment variable for the AWS access token"
fi

if [ -z "$AWS_SECRET_KEY" ]; then
    fnExit 1 "You need to set the AWS_SECRET_KEY environment variable for the AWS secret token"
fi

if ! which aws > /dev/null; then
   fnExit 1 "aws cli was not found. Please install it from here: https://aws.amazon.com/cli/?nc1=h_ls"
fi

if ! which zip > /dev/null; then
   fnExit 1 "zip cli was not found. Please install it from here: 'sudo apt-get install zip'"
fi

EVENT_ID="$1"
S3_BUCKET="magic-mirror-photobooth-gallery-raw"
BASE_PATH="$HOME/.magic-mirror-photobooth"
PHOTOS_PATH="$BASE_PATH/photos"
TMPDIR=$(mktemp -d)
trap "rm -rf $TMPDIR" EXIT

print_status "login to AWS"
aws configure set aws_access_key_id "$AWS_ACCESS_KEY"
aws configure set aws_secret_access_key "$AWS_SECRET_KEY"

print_status "zip $PHOTOS_PATH/${EVENT_ID}/ folder"
zip -j -r ${TMPDIR}/${EVENT_ID}.zip $PHOTOS_PATH/${EVENT_ID}/*

print_status "copy zipped photo folder ${TMPDIR}/${EVENT_ID}.zip to s3 gallery bucket $S3_BUCKET/$EVENT_ID"
aws s3 cp "${TMPDIR}/${EVENT_ID}.zip" "s3://$S3_BUCKET/$EVENT_ID/" --no-guess-mime-type

print_status "script successfully executed"
exit 0