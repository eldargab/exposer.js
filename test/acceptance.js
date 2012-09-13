var fs = require('fs')
var should = require('should')
var rmdir = require('rimraf')
var Lib = require('..')

var root = __dirname + '/fixtures'
var targetDir = root + '/build'

describe('Acceptance tests', function () {
  beforeEach(function (done) {
    rmdir(targetDir, done)
  })

  it('jsBundle', function () {
    var out = targetDir + '/out.js'

    Lib.jsBundle(out, function () {
      this.extensions['.html'] = Lib.compiler('js-string')
      this
        .includeRequire()
        .register('foo', 'foo')
        .closure()
        .add(root, 'foo', function () {
          this.exclude('lib/')
        })
        .add(root, 'foo/lib', {as: 'hello'})
    })

    var req = require(out) // TODO: run this in a separate context

    req('hello').should.equal('hello')
    req('./template').should.equal('template')

    function notExists (name) {
      ;(function () {
        req(name)
      }).should.throw()
    }

    notExists('./lib')
  })
})