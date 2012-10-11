#Exposer

Bundles and compiles things for browser.

##Highlights

``` javascript
var Bundle = require('exposer').js

Bundle('build/mylib.js', function () {
  this
  .add('lib', {as: 'mylib'})
  .add('node_modules', 'debug')
  .add('node_modules', 'progress', function () {
    this.exclude('legacy*')
  })
  .includeRequire()
  .include('/* Copyright ...*/')
  .register('MyLib', 'mylib')
  .closure()
})
```

##Installation

```
$npm install git://github.com/eldargab/exposer.js.git
```

to run tests

```
$npm install -d
$npm test
```

##License

MIT