var PATH = require('path')
var fs = require('fs')
var Emitter = require('events').EventEmitter
var Lookup = require('./lookup')
var util = require('./util')
var use = util.use

module.exports = Compile

function Compile () {
  this.lookups = []
  this.extensions = Object.create(this.extensions || null)
  Emitter.call(this)
}

Compile.prototype = Object.create(Emitter.prototype)

Compile.prototype.add = function (root, path, opts) {
  var self = this
    , args = [].slice.call(arguments)
    , offset = 3

  if (typeof path != 'string') { // support root omission
    opts = path
    path = root
    root = '.'
    offset = 2
  }

  var lookup = new Lookup(PATH.join(root, path))
  lookup.extensions = Object.create(this.extensions)
  use.call(lookup.excludes, this.excludes)

  if (typeof opts == 'function') {
    opts.apply(lookup, args.slice(offset))
  } else if (opts) {
    lookup.as = opts.as
    opts.exclude && lookup.exclude(opts.exclude)
    use.call(lookup.extensions, opts.extensions)
  }
  lookup.as = lookup.as || path

  lookup.on('file', function (p, stat, ext) {
    var compile = this.extensions[ext]; if (!compile) return
    self.emit('file', {
      name: name(this.root, p, this.as),
      stat: stat,
      src: function () {
        return compile(fs.readFileSync(p, 'utf8'), p)
      },
      path: p,
      ext: ext
    })
  })

  this.lookups.push(lookup)

  return this
}

function name (dir, p, prefix) {
 return PATH.join(prefix, PATH.relative(dir, p))
   .replace(/\\/g, '/') // windows support
   .replace(/\.[^\.\/]*$/, '') // trim extension
}

Compile.prototype.exec = function () {
  this.emit('start')
  this.lookups.forEach(function (lookup) {
    lookup.exec()
  })
  this.emit('end')
}

Compile.prototype.use = use

Compile.prototype.ext = function (ext, compiler, opts) {
  this.extensions[ext] = typeof compiler == 'function'
    ? compiler
    : util.compiler(compiler).apply(null, [].slice.call(arguments, 2))
  return this
}