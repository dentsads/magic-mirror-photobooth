#!/bin/bash

# Script to setup the Ubuntu host machine for running
# in uninterrupted kiosk mode
#
# Run as root or insert `sudo -E` before `bash`:
#
# curl -sL https://dentsads-public.s3.eu-central-1.amazonaws.com/magic-mirror-photobooth/scripts/setup.sh | bash -
#   or
# wget -qO- https://dentsads-public.s3.eu-central-1.amazonaws.com/magic-mirror-photobooth/scripts/setup.sh | bash -
#
# Copyright 2020 Dimitrios Dentsas

print_status() {
    echo
    echo -e "##  ${bold}${green}$1${normal}"
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

print_bold() {
    title="$1"
    text="$2"

    echo
    echo "${cyan}================================================================================${normal}"
    echo "${cyan}================================================================================${normal}"
    echo
    echo -e "  ${bold}${green}${title}${normal}"
    echo
    echo -en "  ${text}"
    echo
    echo "${cyan}================================================================================${normal}"
    echo "${cyan}================================================================================${normal}"
}

bail() {
    echo 'Error executing command, exiting'
    exit 1
}

exec_cmd_nobail() {
    echo "+ $1"
    bash -c "$1"
}

exec_cmd() {
    exec_cmd_nobail "$1" || bail
}

sudo_exec_cmd_nobail() {
    echo "+ $1"
    sudo bash -c "$1"
}

sudo_exec_cmd() {
    sudo_exec_cmd_nobail "$1" || bail
}

print_bold "SETUP OF HOST MACHINE" "Setting up Ubuntu host machine for magic-mirror-photobooth..."
sleep 1

print_status "Installing newest stable Google Chrome..."
sudo_exec_cmd 'wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | sudo apt-key add -'
sudo_exec_cmd "echo 'deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main' | sudo tee /etc/apt/sources.list.d/google-chrome.list"
sudo_exec_cmd 'apt-get update'
sudo_exec_cmd 'apt-get install -y google-chrome-stable'

print_status "Disabling screensaver, blank screen and automatic screen lock..."

sudo_exec_cmd 'gsettings set org.gnome.desktop.screensaver lock-enabled false'
sudo_exec_cmd 'gsettings set org.gnome.desktop.lockdown disable-lock-screen true'
sudo_exec_cmd 'gsettings set org.gnome.desktop.session idle-delay 0'

print_status "Create ~/.config/systemd/user if it does not exist already"
exec_cmd 'mkdir -p ~/.config/systemd/user'

print_status "Creating kiosk shell script..."
sudo_exec_cmd 'cat <<EOT > /opt/mkiosk.sh
#!/bin/bash

# rm -rf ~/.{config,cache}/google-chrome/
google-chrome \
--kiosk \
--no-first-run \
--incognito \
--password-store=basic \
--disable-restore-session-state \
--disable-features=TranslateUI \
--disable-session-crashed-bubble \
--app=http://localhost:4200
EOT'
sudo_exec_cmd 'chmod +x /opt/mkiosk.sh'

print_status "Creating systemd service for magic mirror kiosk..."
exec_cmd 'cat <<EOT > ~/.config/systemd/user/mkiosk.service
[Unit]
Description=Magic Mirror Kiosk (MKiosk)
After=docker.service
StartLimitIntervalSec=10
[Service]
Type=simple
Restart=on-failure
ExecStart=/bin/bash -e /opt/mkiosk.sh

[Install]
WantedBy=graphical.target
EOT'

print_status "Start mkiosk systemd service..."
exec_cmd 'systemctl daemon-reload'
exec_cmd 'systemctl --user enable mkiosk'
exec_cmd 'systemctl --user start mkiosk'