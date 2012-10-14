var util = require('./lib/util')
var B = require('./lib/bundle')

exports.require = util.require

exports.compiler = util.compiler

exports.bundler = function (extend) {
  function Bundle (target) {
    B.call(this, target)
  }

  Bundle.prototype = Object.create(B.prototype)

  extend && util.use.apply(Bundle.prototype, arguments)

  return function (target, setup, path, opts) {
    var b = new Bundle(target)
    if (setup) typeof setup == 'function'
      ? setup.apply(b, [].slice.call(arguments, 2))
      : b.add.apply(b, [].slice.call(arguments, 1))
    b.exec()
  }
}

exports.js = exports.bundler(function () {
  this.onfile = function (f) {
    return 'require.register("' + f.name + '", function(module, exports, require) {\n'
      + f.out() + '\n'
      + '})\n'
  }

  this.includeRequire = function () {
    return this.include(require('client-require'))
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
