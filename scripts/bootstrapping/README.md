# Bootstrapping of Docker container

for bootstrapping the installation process of the Docker container run this script

```bash
curl -sL https://dentsads-public.s3.eu-central-1.amazonaws.com/magic-mirror-photobooth/scripts/install.sh | sudo -E bash -
```

This will do the following

* download all relevant assets (images, movies) onto the host machine
* download the latest magic-mirror-photobooth Docker image
* create a new container from it and start it

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
  * disables the "Tranlate UI" feature