const express = require( "express" );
const five = require('johnny-five');
const pixel = require('node-pixel');
//import {Board, Led} from 'johnny-five';
//import {Strip, FORWARD} from 'node-pixel';

const app = express();
const board = new five.Board();

app.get('/', (req, res) => {
    res.send({});
})

app.get('/api/led', (req, res) => {
    board.on("ready", function() {
        // Define our hardware.
        // It's a 12px ring connected to pin 6.
        var strip = new pixel.Strip({
          board: this,
          controller: "FIRMATA",
          strips: [ {pin: 6, length: 24}, ],
          gamma: 2.8,
        });
      
        // Just like DOM-ready for web developers.
        strip.on("ready", function() {
          strip.clear()
          // Set the entire strip to pink.
          //strip.color('#903');
      
          //var color = Color.rgb(0, 50, 0)
          //color.lighten(0.5)
          
          var pos = 0;
          var loopCounter = 0
          var abortAfterLoops = 3
    
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
    
        });

        strip.on("error", function () {
            return res.sendStatus(500);
        })

        res.sendStatus(200)
      
      });
    //res.send({
    //    led: "boom"
    //});
})

app.listen(4201, '127.0.0.1', function() {
    console.log('Server now listenting on 4201');
})