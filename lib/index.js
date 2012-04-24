var Compiler = require('./compiler')
var Bundle = require('./bundle')
var req = require('client-require')
var write = require('./util/write')
var Mtime = require('./util/mtime')
var PATH = require('path')


exports.extensions = require('./extensions')

exports.Expose = Compiler.create({
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
            var t = PATH.resolve(this.target, b.name)
            if (!PATH.extname(t)) t += '.js'
            if (this.recompile || Mtime(t) <= b.mtime) {
                write(t, b.toString())
            }
        }
    }
})

exports.Bundle = Compiler.create({
    init: function () {
        this.bundle = new Bundle
    },

    onmodule: function (m) {
        this.bundle.add(m)
    },

    onend: function () {
        if (!this.recompile && Mtime(this.target) > this.bundle.mtime) return

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

        if (this.global) code = 'var ' + this.global + ' = ' + code

        write(this.target, code)
    }
})