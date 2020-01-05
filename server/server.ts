import express from 'express';
import { Led } from './led';
import { ImageCompositor } from './imagecompositor' ;
import { Photo } from './photo';
import { logger } from './logger';

const app = express();
const led = new Led();
const compositor = new ImageCompositor();
const photo = new Photo();

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/api/photos', express.static('../magic-mirror-photobooth-photos'));
app.use('/api/assets', express.static('../magic-mirror-photobooth-assets'));

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

app.post('/api/logger', (req, res, next) => {
  var jsonObj = req.body

  logger.log(jsonObj.level || 'error', jsonObj.data, { origin: 'client'})
  return res.sendStatus(200)  
})

app.listen(4201, '127.0.0.1', function() {
    console.log('Server now listenting on 4201');
})