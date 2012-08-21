var vm = require('vm')
var fs = require('fs')
var should = require('should')
var Bundle = require('..').Bundle

var root = __dirname + '/fixtures'
var out = root + '/build/out.js'

describe('Integration tests', function () {
    afterEach(function () {
        fs.unlinkSync(out)
        fs.rmdir(root + '/build')
    })

    it('ok', function () {
        Bundle(out, function () {
            this.extensions['.html'] = function (s) {
                return 'module.exports = ' + "'" + s + "'"
            }
            this.includeRequire()
            this.register('foo', 'foo')
            this.closure()
            this.add(root, 'foo', function () {
                this.exclude('lib/')
            })
            this.add(root, 'foo/lib', {as: 'hello'})
        })

        var req = require(out) // TODO: run this in separate context

        req('hello').should.equal('hello')
        req('./template').should.equal('template')

        function notExists (name) {
            try {
                req(name)
                should.throw()
            } catch (e) {}
        }

        notExists('./bin')
        notExists('./package.json')
        notExists('./lib')
    })
})