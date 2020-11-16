# electron-frontend-app

## Build and publish .deb to S3

Build and publish application like this

```bash
# build
npm run make

# publish
npm run publish
```

## Important steps (List not exhaustive)

Add your user `$USER` to the `docker` group in order to avoid having to face an administrator prompt when executing docker restarts through this app.
See here for more details: https://docs.docker.com/engine/install/linux-postinstall/#manage-docker-as-a-non-root-user

### Adding user to docker group

```bash
# create docker group, if needed
sudo groupadd docker

# add current user to this group
sudo usermod -aG docker $USER

# Either log out and back in, or you can also run the following command to activate the changes to groups
exec sg docker "newgrp `id -gn`"

# if you encounter /home/$USER/.docker/config.json: permission denied
sudo chown "$USER":"$USER" /home/"$USER"/.docker -R
sudo chmod g+rwx "$HOME/.docker" -R
```

### Deleting user from docker group

```bash
# remove user from docker group
sudo gpasswd -d $USER docker

# logout and login again for the changes to apply
```