import express from 'express';
import { Led } from './led'

const app = express();
const led = new Led();

app.get('/', (req, res) => {
    res.send({});
})

app.get('/api/led/spin', (req, res) => {      
    led.leftBallSpin();
    res.sendStatus(200)
})

app.get('/api/led/barrel', (req, res) => {      
    led.rightBarrelSpin();
    res.sendStatus(200)
})

app.get('/api/led/clear', (req, res) => {      
    led.clear();
    res.sendStatus(200)
})

app.listen(4201, '127.0.0.1', function() {
    console.log('Server now listenting on 4201');
})