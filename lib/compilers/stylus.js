var stylus = require('stylus')
var use = require('../util').use

module.exports = function (setup) {
  var params = [].slice.call(arguments, 1)
  return function (str, filename) {
    var out, style = stylus(str)
    style.set('filename', filename)
    setup && setup.apply(style, params)
    style.render(function (err, css) {
      if (err) throw err
      out = css
    })
    return out
  }
}