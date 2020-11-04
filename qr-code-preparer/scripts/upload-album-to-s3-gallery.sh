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

	fnExit 1 "Usage: ${THIS_NAME} <EVENT_ID> <PHOTO_PATH>"
}

##
## CHECK PREREQUISITES
##

[ $# -lt 2 ] && fnUsage

EVENT_ID="$1"
PHOTOS_PATH="$2"
S3_BUCKET="magic-mirror-photobooth-gallery"

print_status "sync photo folder $PHOTOS_PATH to s3 gallery bucket $S3_BUCKET/$EVENT_ID/pics/"
aws s3 sync "$PHOTOS_PATH" "s3://$S3_BUCKET/$EVENT_ID/pics/" --no-guess-mime-type --sse AES256 --exclude "*.json"

print_status "script successfully executed"
exit 0