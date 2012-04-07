var Compiler = require('./compiler')
var Bundle = require('./bundle')
var req = require('client-require')

exports.Compiler = Compiler

exports.Expose = Compiler.extend({
    init: function () {
        this.bundles = {}
    },

    onmodule: function (m) {
        (function getBundle () {
            var b, bName = m.name
            do {
                b = this.bundles[bName]
                if (b) return b
                bName = bName.split('/').slice(0, -1).join('/')
            } while (bName)
            return this.bundles[m.name] = new Bundle(m.name)
        }).call(this).add(m)
    },

    onend: function () {
        for (var key in this.bundles) {
            var b = this.bundles[key]
            var t = this.mtarget(b.name)
            if (this.recompile || this.mtime(t) <= b.mtime) {
                this.write(t, b.toString())
            }
        }
    }
})

exports.Bundle = Compiler.extend({
    init: function () {
        this.bundle = new Bundle(this.path)
    },

    onmodule: function (m) {
        this.bundle.add(m)
    },

    onend: function () {
        var t = this.mtarget(this.path)
        if (!this.recompile && this.mtime(t) > this.bundle.mtime) return

        var code = ''

        if (this.bundle.modules.length == 1) {
            // there is only one module, make a simplified wrapper
            code =
                'var module = {exports : {}}\n' +
                'var exports = module.exports\n' +
                this.bundle.module[0].src() +
                'return module.exports\n'
        }
        else {
            if (this.includeRequire) code += req.syncScript() + '\n'
            if (this.includeAsyncRequire) code += req.globalScript() + '\n'
            code += this.bundle.toString()
            if (this.main) code += "return require('" + this.main + "')"
        }

        code = '(function () {\n' + code + '\n})()\n'

        if (this['var']) code = 'var ' + this['var'] + ' = ' + code

        this.write(t, code)
    }
})