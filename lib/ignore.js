var Minimatch = require('minimatch').Minimatch
var PATH = require('path')

module.exports = Ignore

function Ignore (patterns, base) {
    this.rules = patterns.map(function (p) {
        if (p[0] != '/') p = '**/' + p
        return new Minimatch(p, {dot: true})
    })
    this.base = base
}

Ignore.prototype.match = function (path, isDir) {
    path = '/' + PATH.relative(this.base, path).replace(/\\/g, '/')
    if (isDir) path += '/'
    for (var i = 0; i < this.rules.length; i++) {
        if (this.rules[i].match(path)) return true
    }
    return false
}