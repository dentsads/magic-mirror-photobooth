const express = require( "express" );
import { Board } from 'johnny-five';
import { Strip } from 'node-pixel';

const app = express();
const board = new Board();
var strip;

board.on("ready", function() {
    strip = new Strip({
        board: board,
        controller: "FIRMATA",
        strips: [ {pin: 6, length: 24}, ],
        gamma: 2.8,
    });

    strip.on("error", function () {
        console.log("error")
    }) 
});

app.get('/', (req, res) => {
    res.send({});
})

app.get('/api/led', (req, res) => {       
    strip.clear()
   
    var pos = 0;
    var loopCounter = 0
    var abortAfterLoops = 3

    strip.pixel(pos).color([50, 0, 0]);
    strip.show();

    var loop = setInterval(function () {                

    if (++pos >= strip.length) {
        loopCounter++;
        pos = 0;
        strip.clear()
    }        

    // Shift all pixels clockwise
    //strip.shift(1, FORWARD, true);
    strip.pixel(pos).color([50, 0, 0]);
    strip.show();

    if (loopCounter == abortAfterLoops) {
        clearInterval(this)
        strip.clear()
        res.sendStatus(200);
    }            

    }, 1000 / 12); 
})

app.listen(4201, '127.0.0.1', function() {
    console.log('Server now listenting on 4201');
})