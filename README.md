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
- `finish` - when request processed 

Unfortunately, if client is close its connection, there is no event signalling that the server side finished the processing of the request as `finish` event does not fires in this case.
It may be correct from abstract framework perspective as the request to be terminated (and network connection is closed).
However, there are several negative outcomes of this approach. One of them is that middleware has no information when the server has really finished the processing of the request. 

This module overrides `res.end()` function to emit `end` when `res.end()` is called, i.e. when processing by server is finished independently of whether the connection was closed by client or not. 


Usage:
 
```js
var express = require('express');

//var endEvent = require('express-end');
var endEvent = require('../');

var app = express();

app.use(endEvent);

...
```


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
