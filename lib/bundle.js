var PATH = require('path')
var Compile = require('./compile')
var util = require('./util')

module.exports = Bundle

function Bundle (target) {
  this.recompile = true
  this.rebuild = false
  this.target = target
  this.files = []
  Compile.call(this)
}

Bundle.prototype = Object.create(Compile.prototype)

Bundle.prototype.exec = function () {
  this.on('start', function () {
    this.rebuild = this.recompile || !(this.tStat = util.stat(this.target))
  })
  this.on('file', function (file) {
    this.rebuild = this.rebuild || this.tStat.mtime < file.stat.mtime
    this.files.push(file)
  })
  this.on('end', function () {
    if (!this.rebuild) return
    this.out = ''
    this.files.forEach(function (file) {
      this.out += this.onfile(file) + '\n'
    }, this)
    this.emit('out')
    util.write(this.target, this.out)
  })
  Compile.prototype.exec.call(this)
}

Bundle.prototype.onfile = function (file) {
  return file.src()
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