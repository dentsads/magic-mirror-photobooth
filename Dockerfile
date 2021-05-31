FROM node:14.15.0

USER root

ENV HOME /root

WORKDIR $HOME/magic-mirror-photobooth

# install cups and dependencies for printing
RUN echo "deb http://ftp.de.debian.org/debian buster main" | tee -a /etc/apt/sources.list \
&& apt-get update \
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

# install imagemagick for image compositing of printer templates
# see here: https://imagemagick.org/index.php
# 
# install libgphoto2
# see here: http://www.gphoto.org/
#
# install libcairo
# libcairo for usage with https://www.npmjs.com/package/fabric
# see here: https://www.cairographics.org/download/
RUN apt-get update \
&& apt-get -y install \
s3cmd \
build-essential \
usbutils \
udev \
jq \
imagemagick \
libgphoto2-dev \
gphoto2 \
libcairo2-dev \
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

RUN ls -la && pwd && npm run build:client -- --prod && npm run build:server

ENV NODE_ENV production

RUN chmod +x startup.sh

CMD ./startup.sh $(jq -r .printer_name config.json)
