var Minimatch = require('minimatch').Minimatch
var PATH = require('path')
var fs = require('fs')
var mkdir = require('mkdirp').sync


exports.compiler = function (name) {
  var create = require('./compilers/' + name)
  return create.apply(null, [].slice.call(arguments, 1))
}

exports.register = function () {
  return fs.readFileSync(__dirname + '/assets/register.js', 'utf8')
}


exports.write = function (path, str) {
  try {
    mkdir(PATH.dirname(path))
  }
  catch (e) {
    if (e.code != 'EEXIST') throw e
  }
  fs.writeFileSync(path, str, 'utf8')
}


exports.stat = function (path) {
  try {
    return fs.statSync(path)
  }
  catch (e) {
    if (e.code !== 'ENOENT') throw e
  }
  return null
}


exports.use = function (opts) {
  if (typeof opts == 'function') {
    opts.apply(this, [].slice.call(arguments, 1))
  } else {
    for (var key in opts) {
      this[key] = opts[key]
    }
  }
  return this
}

function thisMap (o, name) {
  var map = o[name]
  if (!map) return o[name] = Object.create(null, {
    __owner: {
      value: this
    }
  })
  if (map.__owner !== o) return o[name] = Object.create(map, {
    __owner: {
      value: this
    }
  })
  return map
}

exports.Exclude = {
  exclude: function (pattern, yes) {
    var excludes = thisMap(this, 'excludes')
    if (yes === false) return excludes[pattern] = false
    if (typeof pattern == 'string') {
      var orig = pattern
      if (pattern[0] != '/') pattern = '**/' + pattern
      excludes[orig] = new Minimatch(pattern, {dot: true})
    } else {
      excludes[String(pattern)] = pattern
    }
    return this
  },

  isExcluded: function (p, isDir) {
    p = '/' + p.replace(/\\/g, '/')
    if (isDir) p += '/'
    for (var key in this.excludes) {
      var rule = this.excludes[key]
      if (!rule) continue
      var matched = rule.match
        ? rule.match(p)
        : rule.test
          ? rule.test(p)
          : rule(p)
      if (matched) return true
    }
    return false
  },

  excludes: {}
}

exports.Exclude
  .exclude('.*')
  .exclude('test/')
  .exclude('bin/')

exports.Extensions = {
  ext: function (ext, compiler, opts) {
    var extensions = thisMap(this, 'extensions')
    extensions[ext] = typeof compiler == 'function'
      ? compiler
      : exports.compiler.apply(null, [].slice.call(arguments, 1))
    return this
  },
  extensions: {}
}
