var Log = require('test-log')
var Fs = require('fake-fs')
var Bundle = require('../lib/bundle')
var util = require('../lib/util')

util.compiler('plain') // hack to prevent calls to patched file system

describe('Bundle', function () {
  var fs, log, bundle

  beforeEach(function () {
    fs = new Fs
    fs.patch()
    log = Log()
    bundle = new Bundle('bundle')
    bundle.ext('.js', 'plain')
  })

  afterEach(function () {
    fs.unpatch()
  })

  function read (p) {
    return fs.readFileSync(p, 'utf8')
  }

  it('Should bundle things', function () {
    fs.file('index.js', 'index')
      .file('hello.js', 'hello')

    bundle.onfile = function (f) {
      return '(' + f.out() + ')'
    }

    bundle.add('.').exec()

    read('bundle').should.equal('(index)\n(hello)\n')
  })

  describe('When .recompile is set to false', function () {
    beforeEach(function () {
      fs.file('index.js', 'index')
      bundle.recompile = false
      bundle.ext('.js', 'plain')
      bundle.add('.')
    })

    it('Should not recompile if target is uptodate', function (done) {
      setTimeout(function () {
        fs.file('bundle', 'uptodate')
        bundle.exec()
        read('bundle').should.equal('uptodate')
        done()
      })
    })

    it('Should recompile if target does not exist', function () {
      bundle.exec()
      read('bundle').should.equal('index\n')
    })

    it('Should recompile if target is not uptodate', function () {
      fs.file('bundle', {
        content: 'outdated',
        mtime: new Date(10)
      })
      bundle.exec()
      read('bundle').should.equal('index\n')
    })
  })

  it('test .include()', function () {
    fs.file('index.js', 'index')
    bundle
      .add('.')
      .include('foo')
      .include('bar')
      .exec()
    read('bundle').should.equal('bar\nfoo\nindex\n')
  })

  it('test .append()', function () {
    fs.file('index.js', 'index')
    bundle
      .add('.')
      .append('foo')
      .append('bar')
      .exec()
    read('bundle').should.equal('index\nfoo\nbar\n')
  })
})