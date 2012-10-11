var util = require('./lib/util')

exports.Bundle = require('./lib/bundle')

exports.Lookup = require('./lib/lookup')

exports.Compile = require('./lib/compile')

exports.require = util.require

exports.compiler = util.compiler


function builder (Type) {
  return function (target, setup, path, opts) {
    var b = new Type(target)
    if (setup) typeof setup == 'function'
      ? setup.apply(b, [].slice.call(arguments, 2))
      : b.add.apply(b, [].slice.call(arguments, 1))
    b.exec()
  }
}

exports.bundler = function (extend) {
  function Bundle () {
    exports.Bundle.apply(this, arguments)
  }

  Bundle.prototype = Object.create(exports.Bundle.prototype)

  Bundle.prototype.extensions = {}

  extend && util.use.apply(Bundle.prototype, arguments)

  return builder(Bundle)
}

exports.js = exports.bundler(function () {
  this.onfile = function (f) {
    return 'require.register("' + f.name + '", function(module, exports, require) {\n'
      + f.src() + '\n'
      + '})\n'
  }

  this.includeRequire = function () {
    return this.include(util.require())
  }

  this.register = function (as, main) {
    return this.append(util.register().replace(/\{\{as\}\}/g, as).replace(/\{\{main\}\}/g, main))
  }

  this.closure = function () {
    return this.on('out', function () {
      this.out = ';(function () {\n'
        + this.out + '\n'
        + '})()'
    })
  }

  this.ext('.js', 'plain')
})

exports.css = exports.bundler(function () {
  this.ext('.css', 'plain')
})
