FROM node:11.15.0

USER root

ENV HOME /root

COPY . $HOME/magic-mirror-photobooth

WORKDIR $HOME/magic-mirror-photobooth

RUN echo "fs.inotify.max_user_watches=1048576" >> /etc/sysctl.conf

RUN apt-get update \
&& apt-get -y install s3cmd \
&& apt-get install -y build-essential \
&& apt-get install -y udev \

# install imagemagick for image compositing of printer templates
# see here: https://imagemagick.org/index.php
&& apt-get install -y imagemagick \

# see here: http://www.gphoto.org/
&& apt-get install -y libgphoto2-dev \
&& apt-get install -y gphoto2 \

# libcairo for usage with https://www.npmjs.com/package/fabric
# see here: https://www.cairographics.org/download/
&& apt-get install -y libcairo2-dev \

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


RUN ls -la && pwd && ng build --prod && npm run build:server

ENV NODE_ENV production

CMD ["pm2-runtime", "docker.pm2.ecosystem.config.js"]

#USER node