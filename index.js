var util = require('./lib/util')

exports.Bundle = require('./lib/bundle')

exports.Lookup = require('./lib/lookup')

exports.Compile = require('./lib/compile')

exports.require = util.require

exports.compiler = util.compiler

exports.builder = util.builder

function builder (type) {
  var Builder = util.builder(type)
  return function (target, setup, path, opts) {
    var b = new Builder(target)
    if (setup) typeof setup == 'function'
      ? setup.apply(b, [].slice.call(arguments, 2))
      : b.add.apply(b, [].slice.call(arguments, 1))
    b.exec()
  }
}

exports.jsBundle = builder('js-bundle')