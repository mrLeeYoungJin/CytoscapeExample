var path = require('path');
var express = require('express');

var app = express();

app.use('/', express.static('src'));

app.listen(3000, 'localhost', (err) => {
  if (err) {
    console.log(err);
    return;
  }

  console.log('Listening at http://localhost:3000');
});