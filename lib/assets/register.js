if ( typeof define === "function" && define.amd) {
  define('{{as}}'.toLowerCase(), [], function () { return require('{{main}}') } );
} else if (module && module.exports) {
  module.exports = require('{{main}}')
} else {
  window['{{as}}'] = require('{{main}}')
}