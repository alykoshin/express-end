'use strict';

var express = require('express');
var http    = require('http');

//var end = require('express-end');
var endEventPatch = require('../');

var httpPort = 8080;


var app = express();

//
app.use(endEventPatch);

var count = 0;

app.use(function(req, res, next) {

  var current = ++count;

  console.log('[%d] app.use()', current);

  res.once('close',  function() {
    console.log('[%d] app.use(): res.once(close)', current);
  });

  res.once('end',    function() {
    console.log('[%d] app.use(): res.once(end)', current);
  });

  res.once('finish', function() {
    console.log('[%d] app.use(): res.once(finish)', current);
  });

  next();
});


app.get('/test1', function (req, res) {
  //console.log('get(test1): 1');
  var result = { test: 'test' };
  setTimeout(function() {
    //console.log('get(test1): 2');
    res
      .status(200)
      .send(result);
    //console.log('get(test1): 3');
  }, 1000);

});


var server = http.createServer(app);

server.listen(httpPort, function () {
  console.log('* Server listening at ' +
    server.address().address + ':' +
    server.address().port);
});

