# electron-frontend-app

## Important steps (List not exhaustive)

Add your user `$USER` to the `docker` group in order to avoid having to face an administrator prompt when executing docker restarts through this app.
See here for more details: https://docs.docker.com/engine/install/linux-postinstall/#manage-docker-as-a-non-root-user

```bash
# 1. create docker group, if needed
sudo groupadd docker

# 2. add current user to this group
sudo usermod -aG docker $USER

# 3. Log out and log back in so that your group membership is re-evaluated.
```