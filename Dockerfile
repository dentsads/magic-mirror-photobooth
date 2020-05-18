FROM node:11.15.0

USER root

ENV HOME /root

WORKDIR $HOME/magic-mirror-photobooth

# install cups and dependencies for printing
RUN apt-get update \
&& apt-get -y install \
cups \
printer-driver-cups-pdf \
cups-filters \
whois \
usbutils \
lib32stdc++6 \
lib32gcc1 \
libc6-i386 \
wget \
argyll \
vim

COPY cupsd.conf /etc/cups/

VOLUME /etc/cups/ /var/log/cups /var/spool/cups /var/cache/cups /usr/share/cups /usr/lib/cups /usr/share/ppd

# Remove backends that don't make sense for container
RUN rm /usr/lib/cups/backend/parallel \
  && rm /usr/lib/cups/backend/serial

COPY . $HOME/magic-mirror-photobooth

RUN echo "fs.inotify.max_user_watches=1048576" >> /etc/sysctl.conf

RUN apt-get update \
&& apt-get -y install \
s3cmd \
build-essential \
usbutils \
udev \
jq \

# install imagemagick for image compositing of printer templates
# see here: https://imagemagick.org/index.php
imagemagick \

# see here: http://www.gphoto.org/
libgphoto2-dev \
gphoto2 \

# libcairo for usage with https://www.npmjs.com/package/fabric
# see here: https://www.cairographics.org/download/
libcairo2-dev \

# install other global npm dependencies
&& npm install license-checker -g \
&& npm install @angular/cli -g \
&& npm install typescript -g \
&& npm install pm2@latest -g \
&& npm install ts-node -g \
&& npm install ts-node-dev -g \
&& npm install tslint -g \
&& npm install express -g \
&& npm install @types/express -g \
&& npm install concurrently -g \
&& npm install canvas -g --unsafe-perm=true --allow-root

RUN npm install

# patch the node-pixel library with `j5-firmata-upg` branch, otherwise you will get
# NoWritablePortError: Node Pixel FIRMATA controller requires IO that can write out
RUN git clone https://github.com/ajfisher/node-pixel.git ../node-pixel --branch j5-firmata-upg \
&& rm -rf node_modules/node-pixel \
&& cp -r ../node-pixel/ node_modules/ \
&& rm -rf node_modules/node-pixel/.git

RUN ls -la && pwd && npm run build:client -- --prod && npm run build:server

ENV NODE_ENV production

RUN chmod +x startup.sh
RUN chmod +x bin/status_check.sh

HEALTHCHECK --interval=20s --timeout=20s --start-period=60s --retries=1 CMD bash bin/status_check.sh

CMD ./startup.sh $(jq -r .printer_name config.json)