var fs = require('fs')
var PATH = require('path')
var Emitter = require('events').EventEmitter
var exists = fs.existsSync || PATH.existsSync
var util = require('./util')
var use = util.use

module.exports = Lookups

Lookups.prototype = Object.create(Emitter.prototype)

function Lookups (setup, path, options) {
    this.lookups = []

    this.extensions = {
        '.js': util.compiler('js')
    }

    if (setup) typeof setup == 'function'
        ? this.use.apply(this, arguments)
        : this.add(setup, path, options)
}

Lookups.prototype.use = use

Lookups.prototype.add = function (root, path, opts) {
    var lookup = new Lookup(root, path, this.extensions)

    lookup.onfile = function (name, stat, src) {
        this.emit('file', name, stat, src)
    }.bind(this)

    opts && use.apply(lookup, [].slice.call(arguments, 2))

    this.lookups.push(lookup)
}

Lookups.prototype.exec = function () {
    this.emit('start')
    this.lookups.forEach(function (lookup) {
        lookup.exec()
    })
    this.emit('end')
}


function Lookup (root, path, extensions) {
    this.dir = PATH.resolve(root, path)
    this.root = root

    this.excludes = {
        'bin/': true,
        'test/': true,
        '.*': true
    }

    this.extensions = Object.create(extensions)
}

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

Lookup.prototype.name = function (path) {
    var rel = PATH.relative
    var prefix = this.as || rel(this.root, this.dir)
    return PATH.join(prefix, rel(this.dir, path))
        .replace(/\\/g, '/') // windows support
        .replace(/\.[^\.\/]*$/, '') // trim extension
}

Lookup.prototype.isExcluded = function (path, isDir) {
    if (!this._ignore) {
        var ignore = this._ignore = new util.Ignore(this.root)
        for (var key in this.excludes) {
            this.excludes[key] && ignore.add(key)
        }
    }
    return this._ignore.match(path, isDir)
}

Lookup.prototype.exec = function () {
    this._lookup(this.dir)
}

Lookup.prototype._lookup = function (p) {
    var stat = fs.statSync(p)
    if (this.isExcluded(p, stat.isDirectory())) return
    if (stat.isDirectory()) {
        fs.readdirSync(p).forEach(function (itm) {
            this._lookup(PATH.join(p, itm))
        }, this)
    } else {
        this._visitFile(p, stat)
    }
}

Lookup.prototype._visitFile = function (p, stat) {
    var compile = this.extensions[PATH.extname(p)]
    if (!compile) return
    this.onfile(this.name(p), stat, function src () {
        return compile(fs.readFileSync(p, 'utf8'))
    })
}

Lookup.prototype.onfile = function (name, stat, src) {}
