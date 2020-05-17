#!/bin/bash

set -e # exit immediately if a simple command exits with a non-zero status
set -u # report the usage of uninitialized variables

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

myExit() {
  print_status_red "status check: [FAILED]"
  exit $1
}


set +e

# Check if printer is connected and recognized via USB
gutenprint_device=$(lpinfo -v | grep -i "direct gutenprint")
if [ -z "$gutenprint_device" ]; then
  myExit 1  
fi

# Check if the DSLR camera is connected and can be detected
gphoto_about_camera=$(gphoto2 --about 2>/dev/null)
if [ $? != 0 ] ; then
  myExit 2
fi

# Check if the /api/health endpoint of the app returns a healthy status
curl_health_check=$(curl -s http://localhost:4200/api/health | jq -r .status)
if [ "$curl_health_check" == "unhealthy" ] ; then
  myExit 3
fi

print_status "status check: [PASSED]"
exit 0