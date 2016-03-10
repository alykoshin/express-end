[![npm version](https://badge.fury.io/js/express-end.svg)](http://badge.fury.io/js/express-end)
[![Build Status](https://travis-ci.org/alykoshin/express-end.svg)](https://travis-ci.org/alykoshin/express-end)
[![Coverage Status](https://coveralls.io/repos/alykoshin/express-end/badge.svg?branch=master&service=github)](https://coveralls.io/github/alykoshin/express-end?branch=master)
[![Code Climate](https://codeclimate.com/github/alykoshin/express-end/badges/gpa.svg)](https://codeclimate.com/github/alykoshin/express-end)
[![Inch CI](https://inch-ci.org/github/alykoshin/express-end.svg?branch=master)](https://inch-ci.org/github/alykoshin/express-end)

[![Dependency Status](https://david-dm.org/alykoshin/express-end/status.svg)](https://david-dm.org/alykoshin/express-end#info=dependencies)
[![devDependency Status](https://david-dm.org/alykoshin/express-end/dev-status.svg)](https://david-dm.org/alykoshin/express-end#info=devDependencies)


# express-end

Express middleware to emit `end` event on `res.end()`

`res` object has following events: 
- `header` - when HTTP Header is written, 
- `close`  - when connection is closed from client side
- `finish` - when request processing finished (*) 

(*) Unfortunately, if client has closed its connection, there is no event signalling that the server side finished the processing of the request as `finish` event does not fires in this case.
It may be correct from abstract framework perspective as the request to be terminated without response to the client (and network connection is closed) and looks like it's does not matter whether the server finished the processing or not.
However, there are several negative outcomes of this approach. One of them is that middleware has no information when the server has really finished the processing of the request. 

This module overrides `res.end()` function to emit `end` when `res.end()` is called, i.e. when processing by server is finished independently of whether the connection was closed by client or not. 


Usage example:
 
```js
'use strict';

var express = require('express');
var http    = require('http');
var endMw = require('express-end');
//var endMw = require('../');
var app = express();

app.use(endMw);

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


var httpPort = 8080;
var RESPONSE_DELAY = 1000; // Milliseconds

app.get('/test1', function (req, res) {
  var result = { test: 'test' };
  setTimeout(function() {
    res
      .status(200)
      .send(result);
  }, RESPONSE_DELAY);
});


var server = http.createServer(app);

server.listen(httpPort, function () {
  console.log('* Server listening at %s:%d', server.address().address, server.address().port);
});
```

Log (first request completed by server, second request cancelled by client):

```
$ node app.js 
* Server listening at :::8080
[1] app.use()
[1] app.use(): res.once(end)
[1] app.use(): res.once(finish)
[2] app.use()
[2] app.use(): res.once(close)
[2] app.use(): res.once(end)
``` 

## Running the demo

The source code for this example is located in `demo/` subdirectory of package

In order to run it you need to:
- `cd demo`; 
- start `run_demo.sh` in one terminal to imitate server with `express-end` middleware;
- start `run_batches.sh` in another terminal; when started, press `Ctrl+C` to interrupt active HTTP requests imitating close from client side.

## 1. All the requests were not cancelled by client:

### Log for `run_batches.sh`
```
$ ./run_batches.sh 
This is ApacheBench, Version 2.3 <$Revision: 1663405 $>
Copyright 1996 Adam Twiss, Zeus Technology Ltd, http://www.zeustech.net/
Licensed to The Apache Software Foundation, http://www.apache.org/

Benchmarking 127.0.0.1 (be patient).....done


Server Software:        
Server Hostname:        127.0.0.1
Server Port:            8080

Document Path:          /test1
Document Length:        15 bytes

Concurrency Level:      10
Time taken for tests:   1.007 seconds
Complete requests:      10
Failed requests:        0
Total transferred:      2160 bytes
HTML transferred:       150 bytes
Requests per second:    9.93 [#/sec] (mean)
Time per request:       1007.159 [ms] (mean)
Time per request:       100.716 [ms] (mean, across all concurrent requests)
Transfer rate:          2.09 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    0   0.1      0       0
Processing:  1006 1006   0.3   1006    1007
Waiting:     1003 1004   1.1   1005    1006
Total:       1006 1006   0.2   1006    1007

Percentage of the requests served within a certain time (ms)
  50%   1006
  66%   1007
  75%   1007
  80%   1007
  90%   1007
  95%   1007
  98%   1007
  99%   1007
 100%   1007 (longest request)
```

### log for run_demo.sh

```
$ ./run_demo.sh 
* Server listening at :::8080
[1] app.use()
[2] app.use()
[3] app.use()
[4] app.use()
[5] app.use()
[6] app.use()
[7] app.use()
[8] app.use()
[9] app.use()
[10] app.use()
[1] app.use(): res.once(end)
[1] app.use(): res.once(finish)
[2] app.use(): res.once(end)
[3] app.use(): res.once(end)
[4] app.use(): res.once(end)
[5] app.use(): res.once(end)
[6] app.use(): res.once(end)
[7] app.use(): res.once(end)
[8] app.use(): res.once(end)
[9] app.use(): res.once(end)
[10] app.use(): res.once(end)
[2] app.use(): res.once(finish)
[3] app.use(): res.once(finish)
[4] app.use(): res.once(finish)
[5] app.use(): res.once(finish)
[6] app.use(): res.once(finish)
[7] app.use(): res.once(finish)
[8] app.use(): res.once(finish)
[9] app.use(): res.once(finish)
[10] app.use(): res.once(finish)
```

## 1. All the requests were cancelled by client:

### Log for `run_batches.sh`
```
$ ./run_batches.sh   
This is ApacheBench, Version 2.3 <$Revision: 1663405 $>
Copyright 1996 Adam Twiss, Zeus Technology Ltd, http://www.zeustech.net/
Licensed to The Apache Software Foundation, http://www.apache.org/

Benchmarking 127.0.0.1 (be patient)...^C

Server Software:        
Server Hostname:        127.0.0.1
Server Port:            8080

Document Path:          /test1
Document Length:        0 bytes

Concurrency Level:      10
Time taken for tests:   0.956 seconds
Complete requests:      0
Failed requests:        0
Total transferred:      0 bytes
HTML transferred:       0 bytes
```

### log for run_demo.sh

```
$ ./run_demo.sh 
* Server listening at :::8080
[1] app.use()
[2] app.use()
[3] app.use()
[4] app.use()
[5] app.use()
[6] app.use()
[7] app.use()
[8] app.use()
[9] app.use()
[10] app.use()
[10] app.use(): res.once(close)
[1] app.use(): res.once(close)
[2] app.use(): res.once(close)
[3] app.use(): res.once(close)
[4] app.use(): res.once(close)
[5] app.use(): res.once(close)
[6] app.use(): res.once(close)
[7] app.use(): res.once(close)
[8] app.use(): res.once(close)
[9] app.use(): res.once(close)
[1] app.use(): res.once(end)
[2] app.use(): res.once(end)
[3] app.use(): res.once(end)
[4] app.use(): res.once(end)
[5] app.use(): res.once(end)
[6] app.use(): res.once(end)
[7] app.use(): res.once(end)
[8] app.use(): res.once(end)
[9] app.use(): res.once(end)
[10] app.use(): res.once(end)
```

# More info on `res.end()` and `on('end')` 

You may also have a look on the discussion on the topic at stackexchange: http://codereview.stackexchange.com/questions/20069/monkey-patching-extra-events-in-node-js-http-express



If you have different needs regarding the functionality, please add a [feature request](https://github.com/alykoshin/express-end/issues).


## Installation

```sh
npm install --save express-end
```

## Usage


## Credits
[Alexander](https://github.com/alykoshin/)


# Links to package pages:

[github.com](https://github.com/alykoshin/express-end) &nbsp; [npmjs.com](https://www.npmjs.com/package/express-end) &nbsp; [travis-ci.org](https://travis-ci.org/alykoshin/express-end) &nbsp; [coveralls.io](https://coveralls.io/github/alykoshin/express-end) &nbsp; [inch-ci.org](https://inch-ci.org/github/alykoshin/express-end)


## License

MIT
