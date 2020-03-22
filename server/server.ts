import express from 'express';
import { Led } from './led';
import { ImageCompositor } from './imagecompositor' ;
import { Photo } from './photo';
import { logger } from './logger';
import { Printer } from './printer';
import * as Mustache from 'mustache';
import config from '../config.json'

const fs = require('fs') 
const os = require('os')

var config_dir = os.homedir() + "/" + config.config_dir;
var photos_dir = config_dir + "/" + config.photos_sub_dir;
var assets_dir = config_dir + "/" + config.assets_sub_dir;
var themes_dir = config_dir + "/" + config.themes_sub_dir;

// create config home path if it does not exist
if (!fs.existsSync(config_dir)){
    fs.mkdirSync(config_dir);
}

// create photos path if it does not exist
if (!fs.existsSync(photos_dir)){
  fs.mkdirSync(photos_dir);
}

// create assets home path if it does not exist
if (!fs.existsSync(assets_dir)){
  fs.mkdirSync(assets_dir);
}

// create themes home path if it does not exist
if (!fs.existsSync(themes_dir)){
  fs.mkdirSync(themes_dir);
}

const app = express();
const led = new Led();
const compositor = new ImageCompositor();
const photo = new Photo();
const printer = new Printer();

app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))
app.use('/api/photos', express.static(photos_dir));
app.use('/api/assets', express.static(assets_dir));

app.get('/api/health', (req, res) => {    
  let isHealthyOverall:boolean = 
    led.isHealthy() && 
    photo.isHealthy() &&
    printer.isHealthy();

  let isHealthyString = (isHealthy:boolean):string => isHealthy ? 'healthy' : 'unhealthy';
  let resultHealthJson: object = {
    status: isHealthyString(isHealthyOverall),
    components: [
        {
            name: "led",
            status: isHealthyString(led.isHealthy())
        },
        {
            name: "dslr",
            status: isHealthyString(photo.isHealthy())
        },
        {
          name: "printer",
          status: isHealthyString(printer.isHealthy())
      }
    ]
  };

  if (isHealthyOverall) {
    res.status(200).send(resultHealthJson).end()
  } else {
    res.status(500).send(resultHealthJson).end()
  }
  
})

app.post('/api/led/ball', (req, res) => {
    var jsonObj = req.body
    led.ballSpin(jsonObj)
    .then(() => { 
      logger.log('info', jsonObj);
      res.status(200).send(jsonObj).end()     
    })
    .catch((err) => {
      logger.log('error', err);
      res.status(500).send(err).end()
    });
})

app.post('/api/led/barrel', (req, res) => {
    var jsonObj = req.body
    try {    
      led.barrelSpin(jsonObj)
      logger.log('info', jsonObj);
      res.json(jsonObj)
    } catch (err) {
      logger.log('error', err);
      res.status(500).send(err).end()
    }        
})

app.get('/api/led/clear', (req, res) => {      
    led.clear();
    res.sendStatus(200)
})

app.get('/api/theme', (req, res) => {
  let themeTempateFile:string = fs.readFileSync('./themes/' + config['current_theme'], 'utf8');
  let assetsFile:string = fs.readFileSync('./themes/' + config['current_assets'], 'utf8');  
  let renderedTheme = Mustache.render(themeTempateFile, Object.assign(JSON.parse(assetsFile), config));  
  res.status(200).send(JSON.parse(renderedTheme)).end()
})

app.post('/api/compositor/composite', (req, res, next) => {
  var jsonObj = req.body

  compositor.composite(jsonObj, (out, err) => {
    if (err) {
      logger.log('error', err);
      res.status(500).send(err).end()
    } else {
      logger.log('info', out);
      res.status(200).send(out).end()
    }          
  })    
})

app.post('/api/dslr/capture', (req, res, next) => {
  var jsonObj = req.body

  photo.capturePhoto(jsonObj, (out, err) => {
    if (err) {
      logger.log('error', err);
      res.status(500).send(err).end()
    } else {
      logger.log('info', out);
      res.status(200).send(out).end()
    }          
  })    
})

app.post('/api/printer/print', (req, res, next) => {
  var jsonObj = req.body

  printer.print(jsonObj, (out, err) => {
    if (err) {
      logger.log('error', err);
      res.status(500).send(err).end()
    } else {
      logger.log('info', out);
      res.status(200).send(out).end()
    }          
  })    
})

app.post('/api/logger', (req, res, next) => {
  var jsonObj = req.body

  logger.log(jsonObj.level || 'error', jsonObj.data, { origin: 'client'})
  return res.sendStatus(200)  
})

app.listen(4201, '127.0.0.1', function() {
    console.log('Server now listenting on 4201');
})