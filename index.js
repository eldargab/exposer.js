var util = require('./lib/util')

exports.Bundle = require('./lib/bundle')

exports.Lookup = require('./lib/lookup')

exports.Compile = require('./lib/compile')

exports.require = util.require

exports.compiler = util.compiler

exports.JsBundle = require('./lib/builders/js-bundle')


function builder (Type) {
  return function (target, setup, path, opts) {
    var b = new Type(target)
    if (setup) typeof setup == 'function'
      ? setup.apply(b, [].slice.call(arguments, 2))
      : b.add.apply(b, [].slice.call(arguments, 1))
    b.exec()
  }
}

exports.js = builder(exports.JsBundle)

exports.bundle = builder(exports.Bundle)