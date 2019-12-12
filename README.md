# Photobooth

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 8.3.20.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).


# For using Arduino IDE disable ModemManager in Linux otherwise it intereres with the Arduino IO
```
systemctl status ModemManager.service
systemctl disable ModemManager.service
```

# Installation instructions
```
npm install

# patch the node-pixel library with branch
git clone https://github.com/ajfisher/node-pixel.git
git checkout j5-firmata-upg
rm -rf node_modules/node-pixel
cp -r ../node-pixel/ node_modules/

# somehow the bindins.node is expected elsewhere
mkdir -p ./lib/binding/node-v67-linux-x64/
ln -s ./node_modules/@serialport/bindings/build/Release/bindings.node ./lib/binding/node-v67-linux-x64/bindings.node

npm run build:ssr && sudo npm run serve:ssr
```

# add express web server
npm install express -s
npm install @types/express -s

mdkir server
cd server
sudo npm install ts-node ts-node-dev tslint typescript express @types/express concurrently -g