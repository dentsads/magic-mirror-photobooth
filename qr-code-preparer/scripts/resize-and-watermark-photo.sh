#!/bin/bash

set -e # Any subsequent(*) commands which fail will cause the shell script to exit immediately

THIS_NAME="$(basename "${0}")"
THIS_PATH="$(readlink -f "${0}")"
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

	fnExit 1 "Usage: ${THIS_NAME} <PHOTO_PATH>"
}

##
## CHECK PREREQUISITES
##

[ $# -lt 1 ] && fnUsage

if ! which magick > /dev/null; then
   fnExit 1 "magick cli was not found. Please install it, e.g. with 'apt-get install imagemagick"
fi

BASE_PATH="$HOME/.magic-mirror-photobooth"
EVENT_ID=$(jq -r .event_id $DIR_ROOT/config.json)
PHOTOS_PATH="$BASE_PATH/photos"
SCALED_PHOTOS_PATH="$PHOTOS_PATH/${EVENT_ID}_scaled"

print_status "resizing photos into folder $SCALED_PHOTOS_PATH"
mkdir -p $SCALED_PHOTOS_PATH
magick mogrify \
-auto-orient \
-resize 533 \
-path $SCALED_PHOTOS_PATH \
-draw "image over 380,630 150,150 '"$BASE_PATH"/assets/fotospiegelwelt_logo2_scaled.png'" \
\( -pointsize 15 -fill white  -undercolor '#00000080' -strokewidth 1 -annotate +370+790 'www.fotospiegelwelt.de' \) \
$1


print_status "resizing of photo $1 successfully executed"
exit 0