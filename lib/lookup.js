var fs = require('fs')
var PATH = require('path')
var Emitter = require('events').EventEmitter
var exists = fs.existsSync || PATH.existsSync
var Ignore = require('./util').Ignore

module.exports = Lookup

Lookup.prototype = Object.create(Emitter.prototype)

function Lookup (path) {
  this.root = path
  this.excludes = {
    '.*': true,
    'test/': true,
    'bin/': true
  }
  Emitter.call(this)
}

Lookup.prototype.exclude = function (var_patterns) {
  [].slice.call(arguments).reduce(function (arr, p) {
    return arr.concat(p)
  }, []).forEach(this._exclude, this)
  return this
}

Lookup.prototype._exclude = function (pattern) {
  if (typeof pattern == 'object') {
    for (var key in pattern) {
      this.excludes[key] = pattern[key]
    }
  } else {
    this.excludes[pattern] = true
  }
}

Lookup.prototype.isExcluded = function (path, isDir) {
  if (!this._ignore) {
    this._ignore = new Ignore(this.root)
    for (var key in this.excludes) {
      this.excludes[key] && this._ignore.add(key)
    }
  }
  return this._ignore.match(path, isDir)
}

Lookup.prototype.exec = function () {
  this.emit('start')
  this._lookup(this.root)
  this.emit('end')
}

Lookup.prototype._lookup = function (p) {
  var stat = fs.statSync(p)
  if (this.isExcluded(p, stat.isDirectory())) return
  if (stat.isDirectory()) {
    this.emit('dir', p)
    fs.readdirSync(p).forEach(function (itm) {
      this._lookup(PATH.join(p, itm))
    }, this)
  } else {
    var ext = PATH.extname(p)
    this.emit(ext, p, stat)
    this.emit('file', p, stat, ext)
  }
}
