var PATH = require('path')
var Emitter = require('events').EventEmitter
var Compile = require('./compile')
var util = require('./util')

module.exports = Bundle

function Bundle (target) {
  this.recompile = true
  this.rebuild = false
  this.target = target
  this.files = []
  this.compiles = []
  this.out = ''
  Emitter.call(this)
}

Bundle.prototype = Object.create(Emitter.prototype)

Bundle.prototype.add = function (root, path, opts) {
  var self = this
    , args = [].slice.call(arguments)
    , offset = 3

  if (typeof path != 'string') { // support root omission
    opts = path
    path = root
    root = '.'
    offset = 2
  }

  var c = new Compile(root, path, this)

  if (typeof opts == 'function') {
    opts.apply(c, args.slice(offset))
  } else if (opts) {
    c.as = opts.as
  }

  c.on('out', function (f) {
    self.checkRebuild(f)
    self.files.push(f)
  })

  this.compiles.push(c)

  return this
}

Bundle.prototype.exec = function () {
  this.rebuild = this.recompile || !(this.tStat = util.stat(this.target))

  this.compiles.forEach(function (c) {
    this.emit('compile', c)
    c.exec()
  }, this)

  if (!this.rebuild) return
  this.files.forEach(function (f) {
    this.out += this.onfile(f) + '\n'
  }, this)
  this.emit('out')
  util.write(this.target, this.out)
}

Bundle.prototype.onfile = function (f) {
  return f.out()
}

Bundle.prototype.checkRebuild = function (file) {
  this.rebuild = this.rebuild || this.tStat.mtime < file.stat.mtime
}

Bundle.prototype.include = function (src) {
  this.on('out', function () {
    this.out = src + '\n' + this.out
  })
  return this
}

Bundle.prototype.append = function (src) {
  this.on('out', function () {
    this.out += src + '\n'
  })
  return this
}

Bundle.prototype.use = util.use

Bundle.prototype
  .use(util.Exclude)
  .use(util.Extensions)