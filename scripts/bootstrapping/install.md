# Bootstrapping of Docker container

for bootstrapping the installation process of the Docker container run this script

```bash
curl -sL https://dentsads-public.s3.eu-central-1.amazonaws.com/magic-mirror-photobooth/scripts/install.sh | sudo -E -u $USER bash -
```

This will do the following

* download all relevant assets (images, movies) onto the host machine
* download the latest magic-mirror-photobooth Docker image
* download the latest magic-mirror-photobooth-upload Docker image
* create new containers from both Docke images and start them

# Bootstrapping of Host Ubuntu Machine

for bootstrapping the setup of the Ubuntu host machine run this script

```bash
curl -sL https://dentsads-public.s3.eu-central-1.amazonaws.com/magic-mirror-photobooth/scripts/setup.sh | sudo bash -
```

This will do the following

* install the newest stable Google Chrome package
* disable sleep mode completely for the host machine
* enable automatic login to host machine (no user credentials required)
* setup a systemd service for Chrome that
  * starts it in kiosk mode
  * starts it in incognito mode
  * uses the basic password store
  * automatically loads the magic-mirror frontend URL
  * disables the session crashed popups
  * disables the "Translate UI" feature
* add current user to docker group
* install electron frontend app .deb file
* add udev rules in order to map the touchframe to the right output screen when the USB is plugged in