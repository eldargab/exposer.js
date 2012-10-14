var Emitter = require('events').EventEmitter
var fs = require('fs')
var PATH = require('path')
var join = PATH.join
var relative = PATH.relative
var util = require('./util')

module.exports = Compile

function Compile (root, path, settings) {
  this.root = root
  this.path = path
  if (settings) {
    this.extensions = settings.extensions || this.extensions
    this.excludes = settings.excludes || this.excludes
  }
  Emitter.call(this)
  this.init()
}

Compile.prototype = Object.create(Emitter.prototype)

Compile.prototype.init = function () {
  this.on('traverse', function (file) {
    var compile = this.extensions[file.ext]
    if (!compile) return
    file.out = function () {
      return compile(this.read(), this.path)
    }
    this.emit('out', file)
  })
}

Compile.prototype.exec = function () {
  this.traverse(join(this.root, this.path))
}

Compile.prototype.traverse = function (p) {
  var stat = fs.statSync(p)
  if (this.isExcluded(relative(this.root, p), stat.isDirectory())) return
  if (stat.isDirectory()) {
    fs.readdirSync(p).forEach(function (itm) {
      this.traverse(join(p, itm))
    }, this)
  } else {
    this.emit('traverse', {
      path: p,
      name: this.name(p),
      stat: stat,
      ext: PATH.extname(p),
      read: function () {
        return fs.readFileSync(this.path, 'utf8')
      }
    })
  }
}

Compile.prototype.name = function (p) {
 return join(this.as || this.path, relative(join(this.root, this.path), p))
   .replace(/\\/g, '/') // windows support
   .replace(/\.[^\.\/]*$/, '') // trim extension
}

Compile.prototype.use = util.use

Compile.prototype
  .use(util.Exclude)
  .use(util.Extensions)