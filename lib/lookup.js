var fs = require('fs')
var PATH = require('path')
var extensions = require('./extensions')
var Module = require('./module')
var Package = require('./package')
var Ignore = require('./util/ignore')
var tryStat = require('./util/try-stat')

module.exports = Lookup

function Lookup (root, path) {
    this.root = root
    this.path = path

    this.excludes = {
        'package.json': true,
        'bin/': true,
        'test/': true,
        '.*': true
    }

    this.extensions = Object.create(extensions)
}

Lookup.prototype.onmodule = function (m) {}

Lookup.prototype.exclude = function (patterns) {
    patterns = Array.isArray(patterns) ? patterns : [patterns]
    patterns.forEach(this._exclude, this)
}

Lookup.prototype._exclude = function (pattern) {
    if (typeof pattern == 'object') {
        for (var key in this.excludes) {
            this.excludes[key] = pattern[key]
        }
    } else {
        this.excludes[pattern] = true
    }
}

Lookup.prototype.exec = function () {
    this._lookup(PATH.resolve(this.root, this.path))
}

Lookup.prototype._lookup = function (p) {
    var stat = fs.statSync(p)
    if (this.isExcluded(p, stat.isDirectory())) return
    if (stat.isDirectory()) {
        this._visitDir(p, stat)
        fs.readdirSync(p).forEach(function (itm) {
            this._lookup(PATH.join(p, itm))
        }, this)
    }
    else {
        this._visitFile(p, stat)
    }
}

Lookup.prototype._visitDir = function (dir, stat) {
    var self = this
    var name = this.name(dir)
    var pkg

    pkg = (function tryPkgJson () {
        var path = PATH.join(dir, 'package.json')
        var stat = tryStat(path)
        if (!stat) return
        var config = JSON.parse(fs.readFileSync(path, 'utf8'))
        if (config.main)
            return new Package(name, config.main, stat.mtime)
    })()

    if (!pkg) pkg = (function tryIndex () {
        for (var ext in self.extensions) {
            var index = 'index' + ext
            if (PATH.existsSync(PATH.join(dir, index)))
                return new Package(name, index, stat.mtime)
        }
    })()

    if (pkg) this.onmodule(pkg)
}

Lookup.prototype._visitFile = function (path, stat) {
    var ext = PATH.extname(path)
    var compile = this.extensions[ext]
    if (!compile) return
    var m = new Module(
        this.name(path),
        function src () {
            return compile(fs.readFileSync(path, 'utf8'))
        },
        stat.mtime
    )
    this.onmodule(m)
}

Lookup.prototype.name = function (path) {
    return PATH.relative(this.root, path).replace(/\\/g, '/')
}

Lookup.prototype.isExcluded = function (path, isDir) {
    if (!this._ignore) {
        var ignore = this._ignore = new Ignore(this.root)
        for (var key in this.excludes) {
            if (this.excludes[key]) ignore.add(key)
        }
    }
    return this._ignore.match(path, isDir)
}