var minstache = require('minstache')

module.exports = function (type, ctx) {
  if (type != 'html' && type != 'fn')
    throw new Error(
      'Wrong minstache compiler type: ' + String(type) +
      '. Should be "html" or "fn"'
    )
  return type == 'html'
    ? function (s) {
      return minstache(s, ctx)
    }
    : function (s) {
      return 'module.exports = ' + minstache.compile(s)
    }
}