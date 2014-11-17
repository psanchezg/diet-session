diet-session
============

A filesystem session manager for diet.
It uses cookies for restore session between navigation.

## **Install**
```
npm install diet-session
```

## **Example Usage**
```js
var server = require('diet');
app = new server();
app.domain('http://localhost:8000/');
app.plugin('diet-session', {
  alias: 'session',
	secret: 'SomeSecretPhrase'
});
app.start();

app.get('/', function($){
    // set session data
    $.session.data.user = "guest";
  	$.session.save();
    
    // read session data
    console.log($.session.data.user)  // -> 'guest'    
    console.log($.session.data)      // -> { user: 'guest' }
    
    // destroy session
    $.cookies.destroy();
    
    $.end()
})
```

## **Read Session**
Session data is stored in the `$.session.data` object.
```js
$.session.data.your_data
$.session.data.other_data
```
Session id and name is stored in the `$.session.session` object.
```js
$.session.session.id
$.session.session.name
```

## **Save Session**
Store session data in filesystem (in options.dir path)
```js
// api
$.session.save()
```
Parent path must exist before store session

## **Destroy session**
Clear session data and delete data file in filesystem
```js
// api
$.cookies.destroy()
```

# MIT Licensed

Copyright (c) 2014 Pablo Sánchez <psanchezg@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.