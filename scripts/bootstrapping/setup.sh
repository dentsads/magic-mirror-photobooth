#!/bin/bash

# Script to setup the Ubuntu host machine for running
# in uninterrupted kiosk mode
#
# Run like this:
#
# curl -sL https://dentsads-public.s3.eu-central-1.amazonaws.com/magic-mirror-photobooth/scripts/setup.sh | sudo bash -
#   or
# wget -qO- https://dentsads-public.s3.eu-central-1.amazonaws.com/magic-mirror-photobooth/scripts/setup.sh | sudo bash -
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

exec_cmd_no_sudo_nobail() {
    echo "+ $1"
    sudo -u ${SUDO_USER} bash -c "$1"
}

exec_cmd_no_sudo() {
    exec_cmd_no_sudo_nobail "$1" || bail
}

print_bold "SETUP OF HOST MACHINE" "\

Setting up Ubuntu host machine for magic-mirror-photobooth...

 |  \/  |           (_)      |  \/  (_)                    
 | \  / | __ _  __ _ _  ___  | \  / |_ _ __ _ __ ___  _ __ 
 | |\/| |/ _` |/ _` | |/ __| | |\/| | | '__| '__/ _ \| '__|
 | |  | | (_| | (_| | | (__  | |  | | | |  | | | (_) | |   
 |_|  |_|\__,_|\__, |_|\___| |_|  |_|_|_|  |_|  \___/|_|   
                __/ |                                      
               |___/ 
"
sleep 1

print_status "Installing newest stable Google Chrome..."
exec_cmd 'wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | sudo apt-key add -'
exec_cmd "echo 'deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main' | sudo tee /etc/apt/sources.list.d/google-chrome.list"
exec_cmd 'apt-get update'
exec_cmd 'apt-get install -y google-chrome-stable'

# search for gsettings schemas, e.g.
# gsettings list-recursively | grep screen-keyboard | sort
#
# describe or list possible values (range), e.g.
# gsettings describe|range org.gnome.settings-daemon.plugins.power idle-dim
#
# get values schema key, e.g.
# gsettings get org.gnome.settings-daemon.plugins.power idle-dim
print_status "Disabling screensaver, blank screen, automatic screen lock, etc..."
exec_cmd 'gsettings set org.gnome.desktop.screensaver lock-enabled false'
exec_cmd 'gsettings set org.gnome.desktop.lockdown disable-lock-screen true'
exec_cmd 'gsettings set org.gnome.desktop.session idle-delay 0'
exec_cmd 'gsettings set org.gnome.settings-daemon.plugins.power idle-dim false'
exec_cmd 'gsettings set org.gnome.settings-daemon.plugins.power notify-perhaps-recall false'
exec_cmd 'gsettings set org.gnome.settings-daemon.plugins.power sleep-inactive-ac-type nothing'
exec_cmd 'gsettings set org.gnome.settings-daemon.plugins.power sleep-inactive-battery-type nothing'
exec_cmd 'gsettings set org.gnome.desktop.a11y.applications screen-keyboard-enabled false'
exec_cmd 'gsettings set org.gnome.settings-daemon.plugins.power lid-close-suspend-with-external-monitor false'
exec_cmd 'gsettings set org.gnome.settings-daemon.plugins.power notify-perhaps-recall false'
exec_cmd 'gsettings set org.gnome.settings-daemon.plugins.power percentage-low 0'
exec_cmd 'gsettings set org.gnome.settings-daemon.plugins.power percentage-critical 0'
exec_cmd 'gsettings set org.gnome.settings-daemon.plugins.power percentage-action 0'

print_status "Enable automatic login to Ubuntu for current user ${SUDO_USER}..."
exec_cmd "sed -ie 's/^.*AutomaticLoginEnable *= *.*$/AutomaticLoginEnable=true/g' /etc/gdm3/custom.conf"
exec_cmd "sed -ie 's/^.*AutomaticLogin *= *.*$/AutomaticLogin='"${SUDO_USER}"'/g' /etc/gdm3/custom.conf"


print_status "Disable gnome shell multitouch gestures..."
exec_cmd_no_sudo 'mkdir -p ~/.local/share/gnome-shell/extensions/disable-gestures@dentsads'
exec_cmd_no_sudo 'cat <<EOT > ~/.local/share/gnome-shell/extensions/disable-gestures@dentsads/metadata.json
{
  "_generated": "Generated by SweetTooth, do not edit", 
  "description": "Disable all gnome built in gestures. Useful for kiosks and touch screen apps.", 
  "name": "Disable Gestures", 
  "shell-version": [
    "3.20.4"
  ], 
  "url": "", 
  "uuid": "disable-gestures@dentsads", 
  "version": 2
}
EOT'

exec_cmd_no_sudo 'cat <<EOT > ~/.local/share/gnome-shell/extensions/disable-gestures@dentsads/extension.js
function enable() {
	global.stage.get_actions().forEach(a => a.enabled = false);
}
function disable() {
	global.stage.get_actions().forEach(a => a.enabled = true);
}
EOT'

print_status "Set correct file permissions for gnome shell extension..."
exec_cmd "chmod 755 ~/.local/share/gnome-shell/extensions/disable-gestures@dentsads/metadata.json"
exec_cmd "chmod 755 ~/.local/share/gnome-shell/extensions/disable-gestures@dentsads/extension.js"

print_status "Enable the gnome shell extension..."
exec_cmd 'gnome-shell-extension-tool -e disable-gestures@dentsads || echo 0'

print_status "Restart gnome shell..."
exec_cmd 'killall -3 gnome-shell'

sleep 2

print_status "Create ~/.config/systemd/user if it does not exist already..."
exec_cmd_no_sudo 'mkdir -p ~/.config/systemd/user'

print_status "Creating mkiosk shell script..."
exec_cmd "cat <<EOT > /opt/mkiosk.sh
#!/bin/bash

# map touch frame input to monitor output
xinput --map-to-output \"\$(xinput list --name-only | grep '^Touchscreen small size$')\" VGA-1

# clean config and cache and start chrome in kiosk mode
rm -rf ~/.{config,cache}/google-chrome/
/usr/bin/google-chrome \
--kiosk \
--no-first-run \
--incognito \
--password-store=basic \
--disable-restore-session-state \
--disable-features=TranslateUI \
--disable-session-crashed-bubble \
--noerrdialogs \
--app=http://localhost:4200
EOT"
exec_cmd 'chmod +x /opt/mkiosk.sh'

print_status "Creating systemd service for magic mirror kiosk..."
exec_cmd_no_sudo 'cat <<EOT > ~/.config/systemd/user/mkiosk.service
[Unit]
Description=Magic Mirror Kiosk (MKiosk)
After=docker.service

[Service]
Type=simple
Restart=on-failure

ExecStart=/bin/bash -e /opt/mkiosk.sh

[Install]
WantedBy=graphical.target
EOT'

print_status "Start mkiosk systemd service..."
exec_cmd 'systemctl daemon-reload'
exec_cmd_no_sudo 'XDG_RUNTIME_DIR="/run/user/$UID" DBUS_SESSION_BUS_ADDRESS="unix:path=${XDG_RUNTIME_DIR}/bus" systemctl --user enable mkiosk'
exec_cmd_no_sudo 'XDG_RUNTIME_DIR="/run/user/$UID" DBUS_SESSION_BUS_ADDRESS="unix:path=${XDG_RUNTIME_DIR}/bus" systemctl --user start mkiosk'