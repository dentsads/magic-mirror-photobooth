import express from 'express';
import { Led } from './led'

const app = express();
const led = new Led();

app.use(express.json())
app.use(express.urlencoded({ extended: true })) 

app.post('/api/led/ball', (req, res) => {
    var jsonObj = req.body
    try {
      led.ballSpin(jsonObj)
      res.json(jsonObj)
    } catch (e) {
      res.status(500).send("There was an error: " + e)
    }   
})

app.post('/api/led/barrel', (req, res) => {
    var jsonObj = req.body
    try {    
      led.barrelSpin(jsonObj)
      res.json(jsonObj)
    } catch (e) {
      res.status(500).send("There was an error: " + e)
    }        
})

app.get('/api/led/clear', (req, res) => {      
    led.clear();
    res.sendStatus(200)
})

app.listen(4201, '127.0.0.1', function() {
    console.log('Server now listenting on 4201');
})