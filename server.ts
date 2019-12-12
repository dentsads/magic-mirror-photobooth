/**
 * *** NOTE ON IMPORTING FROM ANGULAR AND NGUNIVERSAL IN THIS FILE ***
 *
 * If your application uses third-party dependencies, you'll need to
 * either use Webpack or the Angular CLI's `bundleDependencies` feature
 * in order to adequately package them for use on the server without a
 * node_modules directory.
 *
 * However, due to the nature of the CLI's `bundleDependencies`, importing
 * Angular in this file will create a different instance of Angular than
 * the version in the compiled application code. This leads to unavoidable
 * conflicts. Therefore, please do not explicitly import from @angular or
 * @nguniversal in this file. You can export any needed resources
 * from your application's main.server.ts file, as seen below with the
 * import for `ngExpressEngine`.
 */

import 'zone.js/dist/zone-node';

import * as express from 'express';
import {join} from 'path';

import {Board, Led} from 'johnny-five';
import {Strip, FORWARD} from 'node-pixel';

const board = new Board();

// Express server
const app = express();

const PORT = process.env.PORT || 4000;
const DIST_FOLDER = join(process.cwd(), 'dist/browser');

// * NOTE :: leave this as require() since this file is built Dynamically from webpack
const {AppServerModuleNgFactory, LAZY_MODULE_MAP, ngExpressEngine, provideModuleMap} = require('./dist/server/main');

// Our Universal express-engine (found @ https://github.com/angular/universal/tree/master/modules/express-engine)
app.engine('html', ngExpressEngine({
  bootstrap: AppServerModuleNgFactory,
  providers: [
    provideModuleMap(LAZY_MODULE_MAP)
  ]
}));

app.set('view engine', 'html');
app.set('views', DIST_FOLDER);

// Example Express Rest API endpoints
// app.get('/api/**', (req, res) => { });
// Serve static files from /browser
app.get('*.*', express.static(DIST_FOLDER, {
  maxAge: '1y'
}));

// All regular routes use the Universal engine
app.get('*', (req, res) => {
  res.render('index', { req });
});

// Start up the Node server
app.listen(PORT, () => {
  console.log(`Node Express server listening on http://localhost:${PORT}`);

  board.on("ready", function() {
    // Define our hardware.
    // It's a 12px ring connected to pin 6.
    var strip = new Strip({
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
        }            

      }, 1000 / 12); 

    });
  
  });

});
