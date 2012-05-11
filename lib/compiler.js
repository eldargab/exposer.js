var Lookup = require('./lookup')

module.exports = Compiler

function Compiler (target, setup, path, options) {
    this.target = target
    this.recompile = false
    if (this.init) this.init()
    if (setup) {
        typeof setup == 'function'
            ? setup.call(this)
            : this.add(setup, path, options)
    }
    this.onend()
}

Compiler.prototype.add = function (root, path, opts) {
    var lookup = new Lookup(root, path)
    lookup.onmodule = this.onmodule.bind(this)
    if (typeof opts == 'function') {
        opts.call(lookup)
    } else if (opts) {
        opts.excluding && lookup.exclude(opts.excluding)
        lookup.as = opts.as
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
