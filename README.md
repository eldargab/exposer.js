#Exposer

Compiles node modules for the browser. It is similiar to
[browserbuild](https://github.com/LearnBoost/browserbuild),
[browserify](https://github.com/substack/node-browserify) and friends.

##Highlights

``` javascript
var Bundle = require('exposer').Bundle

Bundle('build/mylib.js', function () {
    this.add('.', 'lib', {as: 'mylib'})
    this.add('node_modules', 'debug')
    this.add('node_modules', 'progress', function () {
        this.exclude('legacy-support/')
    })
    this.includeRequire()
    this.include('/* Copyright ...*/')
    this.register('MyLib', 'mylib')
    this.closure()
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