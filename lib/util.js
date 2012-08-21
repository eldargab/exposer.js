var Minimatch = require('minimatch').Minimatch
var PATH = require('path')
var fs = require('fs')
var mkdir = require('mkdirp').sync


exports.compiler = function (name) {
    return require('./compilers/' + name)
}


exports.require = function () {
    return fs.readFileSync(__dirname + '/assets/require.js', 'utf8')
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


exports.Ignore = Ignore

function Ignore (base) {
    this.rules = []
    this.base = base
}

Ignore.prototype.add = function (p) {
    if (p[0] != '/') p = '**/' + p
    this.rules.push(new Minimatch(p, {dot: true}))
}

Ignore.prototype.match = function (path, isDir) {
    path = '/' + PATH.relative(this.base, path).replace(/\\/g, '/')
    if (isDir) path += '/'
    for (var i = 0; i < this.rules.length; i++) {
        if (this.rules[i].match(path)) return true
    }
    return false
}