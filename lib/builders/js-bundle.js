var Bundle = require('../bundle')
var util = require('../util')

module.exports = JsBundle

function JsBundle () {
  Bundle.apply(this, arguments)
}

JsBundle.prototype = Object.create(Bundle.prototype)

JsBundle.prototype.onfile = function (f) {
  return 'require.register("' + f.name + '", function(module, exports, require) {\n'
    + f.src() + '\n'
    + '})\n'
}

JsBundle.prototype.includeRequire = function () {
  return this.include(util.require())
}

JsBundle.prototype.register = function (as, main) {
  return this.append(util.register().replace(/\{\{as\}\}/g, as).replace(/\{\{main\}\}/g, main))
}

JsBundle.prototype.closure = function () {
  return this.on('out', function () {
    this.out = ';(function () {\n'
      + this.out + '\n'
      + '})()'
  })
}

JsBundle.prototype.extensions = {
  '.js': util.compiler('fake')
}
