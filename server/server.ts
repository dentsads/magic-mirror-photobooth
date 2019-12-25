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
    .then(() => res.status(200).send(jsonObj).end())
    .catch((err) => {
      logger.error(err)
      res.status(500).send(err).end()
    });
})

app.post('/api/led/barrel', (req, res) => {
    var jsonObj = req.body
    try {    
      led.barrelSpin(jsonObj)
      res.json(jsonObj)
    } catch (err) {
      logger.error(err)
      res.status(500).send("There was an error: " + err)
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
      res.status(500).send(err).end()
    } else {
      res.status(200).send(out).end()
    }          
  })    
})

app.post('/api/dslr/capture', (req, res, next) => {
  var jsonObj = req.body

  photo.caputurePhoto(jsonObj, (out, err) => {
    if (err) {
      res.status(500).send(err).end()
    } else {
      res.status(200).send(out).end()
    }          
  })    
})


app.listen(4201, '127.0.0.1', function() {
    console.log('Server now listenting on 4201');
})