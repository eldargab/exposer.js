var fs = require('fs')
var Lookup = require('./lookup')
var util = require('./util')

function Bundle (target, setup, path, opts) {
    this.recompile = true
    this.rebuild = false
    this.target = target
    this.files = []
    Lookup.apply(this, [].slice.call(arguments, 1))
}

Bundle.prototype = Object.create(Lookup.prototype)

Bundle.prototype.include = function (src) {
    this.on('out', function () {
        this.out = src + '\n' + this.out
    })
}

Bundle.prototype.append = function (src) {
    this.on('out', function () {
        this.out += '\n' + src
    })
}

Bundle.prototype.includeRequire = function () {
    this.include(util.require())
}

Bundle.prototype.register = function (as, main) {
    this.append(util.register().replace(/\{\{as\}\}/g, as).replace(/\{\{main\}\}/g, main))
}

Bundle.prototype.closure = function () {
    this.on('out', function () {
        this.out = '(function () {\n'
            + this.out + '\n'
            + '})()'
    })
}

module.exports = function (target, setup, path, opts) {
    new Bundle(target, setup, path, opts)
    .on('start', function () {
        this.rebuild = this.recompile || !(this.tStat = util.stat(this.target))
    })
    .on('file', function (name, stat, src) {
        this.rebuild = this.rebuild || this.tStat.mtime < stat.mtime
        this.files.push({
            name: name,
            src: src
        })
    })
    .on('end', function () {
        if (!this.rebuild) return
        this.out = ''
        this.files.forEach(function (f) {
            this.out += 'require.register("' + f.name + '", function(module, exports, require) {\n'
                + f.src() + '\n'
                + '})\n'
        }, this)
        this.emit('out')
        util.write(this.target, this.out)
    }).exec()
}