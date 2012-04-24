var Minimatch = require('minimatch').Minimatch
var PATH = require('path')

module.exports = Ignore

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