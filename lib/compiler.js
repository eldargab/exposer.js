var fs = require('fs')
var PATH = require('path')
var mkdirp = require('mkdirp')
var Ignore = require('./ignore')
var extensions = require('./extensions')

module.exports = Compiler

function Compiler (root, path, target) {
    this.root = root
    this.target = target
    this.path = path
    this.excludes = ['test/', 'bin/', '.*']
    this.extensions = Object.create(extensions)
    this.recompile = false
}

Compiler.prototype.onmodule = function (m) {}

Compiler.prototype.onend = function () {}

Compiler.prototype.exec = function () {
    this._lookup(PATH.resolve(this.root, this.path))
    this.onend()
}

Compiler.prototype._lookup = function (p) {
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

Compiler.prototype._visitDir = function (dir, stat) {
    var self = this
    var name = this.name(dir)
    var pkg

    pkg = (function tryPkgJson () {
        var path = PATH.join(dir, 'package.json')
        var stat = tryStat(path)
        if (!stat) return
        var config = JSON.parse(fs.readFileSync(path, 'utf8'))
        if (config.main)
            return self.onmodule(new Package(name, config.main, stat.mtime))
    })()

    if (pkg) return pkg

    return (function tryIndex () {
        for (var ext in self.extensions) {
            var index = 'index' + ext
            if (PATH.existsSync(PATH.join(dir, index)))
                return self.onmodule(new Package(name, index, stat.mtime))
        }
    })()
}

Compiler.prototype._visitFile = function (path, stat) {
    var ext = PATH.extname(path)
    var compiler = this.extensions[ext]
    if (!compiler) return

    this.onmodule(new Module(this.name(path), function src () {
        return compiler(fs.readFileSync(path, 'utf8'))
    }, stat.mtime))
}

function Package (name, main, mtime) {
    if (main.charAt(0) != '.' || main.charAt(0) != '/')
        main = './' + main;

    this.main = main
    this.name = name
    this.mtime = mtime
    this.isPackage = true
}


function Module (name, read, mtime) {
    this.name = name
    this._read = read
    this.mtime = mtime
}

Module.prototype.src = function () {
    if (this._src) return this._src
    return this._src = this._read()
}

Module.prototype.requires = function () {
    var deps = [];

    this.src()
        .replace( /(\/\*([\s\S]*?)\*\/|\/\/(.*)$)/mg, '') // remove comments
        .replace(/require\(\s*["']([^'"\s]+)["']\s*\)/g, function (match, dependency) {
            deps.push(dependency);
            return match;
        });

    return deps;
}

Compiler.prototype.isExcluded = function (path, isDir) {
    if (!this._ignore) {
        this._ignore = new Ignore(this.excludes, this.root)
    }
    return this._ignore.match(path, isDir)
}

Compiler.prototype.write = function (path, str) {
    try {
        mkdirp.sync(PATH.dirname(path))
    }
    catch (e) {
        if (e.code != 'EEXIST') throw e
    }
    fs.writeFileSync(path, str, 'utf8')
}

Compiler.prototype.mtarget = function (modName) {
    var t = PATH.join(this.target, modName)
    if (!PATH.extname(t)) t += '.js'
    return t
}

Compiler.prototype.mtime = function (path) {
    var stat = tryStat(path)
    return stat ? stat.mtime : 0
}

Compiler.prototype.name = function (path) {
    return PATH.relative(this.root, path).replace(/\\/g, '/')
}

Compiler.extend = function (methods) {
    function Comp (root, path, target) {
        Compiler.call(this, root, path, target)
        if (this.init) this.init()
    }

    Comp.prototype = Object.create(Compiler.prototype)

    for (var key in methods) {
        Comp.prototype[key] = methods[key]
    }

    return Comp
}


function tryStat (path) {
    try {
        return fs.statSync(path)
    }
    catch (e) {
        if (e.code !== 'ENOENT') throw e
    }
}