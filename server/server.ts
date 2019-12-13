import express from 'express';
import { Led } from './led'

const app = express();
const led = new Led();

app.use(express.json())
app.use(express.urlencoded({ extended: true })) 

app.get('/', (req, res) => {
    res.send({});
})

app.post('/api/led/ball', (req, res) => {  
    led.ballSpin(req.body);
    res.json(req.body)
})

app.post('/api/led/barrel', (req, res) => {       
    led.barrelSpin(req.body);
    res.json(req.body)
})

app.get('/api/led/clear', (req, res) => {      
    led.clear();
    res.sendStatus(200)
})

app.listen(4201, '127.0.0.1', function() {
    console.log('Server now listenting on 4201');
})