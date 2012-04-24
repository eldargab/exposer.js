var Lookup = require('./lookup')

module.exports = Compiler

function Compiler (target, setup, path, excludes) {
    this.target = target
    this.recompile = false
    if (this.init) this.init()
    if (setup) {
        typeof setup == 'function'
            ? setup.call(this)
            : this.add(setup, path, excludes)
    }
    this.onend()
}

Compiler.prototype.add = function (root, path, excludes) {
    var lookup = new Lookup(root, path)
    lookup.onmodule = this.onmodule.bind(this)
    if (typeof excludes == 'function') {
        excludes.call(lookup)
    } else if (excludes) {
        lookup.exclude(excludes)
    }
    lookup.exec()
}

Compiler.prototype.onmodule = function (m) {}

Compiler.prototype.onend = function () {}

Compiler.create = function (methods) {
    function Comp (target, setup, path, excludes) {
        if (this instanceof Comp) {
            Compiler.call(this, target, setup, path, excludes)
        } else {
            return new Comp(target, setup, path, excludes)
        }

    }

    Comp.prototype = Object.create(Compiler.prototype)

    for (var key in methods) {
        Comp.prototype[key] = methods[key]
    }

    return Comp
}
