const express = require('express');
const path = require('path');

const app = express();

var public = path.join(__dirname, '/../dist/photobooth');

app.use('/', express.static(public));

app.get('/', function(req, res) {
    res.sendFile(path.join(public, 'index.html'));
});

app.listen(4200, '127.0.0.1', function() {
    console.log('Server now listenting on 4200');
})