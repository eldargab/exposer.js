var jade = require('jade')
var use = require('../util').use

module.exports = function (type, opts) {
  if (type != 'html')
    throw new Error(
      'Wrong jade compiler type: "' + String(type) +
      '". Should be "html" or "fn"'
    )
  var params = [].slice.call(arguments, 1)
  return function (s, filename) {
    var o = {filename: filename}
    opts && use.apply(o, params)
    var out
    jade.render(s, o, function (err, html) {
      if (err) throw err
      out = html
    })
    return out
  }
}