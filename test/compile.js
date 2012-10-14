var Fs = require('fake-fs')
var Log = require('test-log')
var resolve = require('path').resolve
var Compile = require('../lib/compile')
var util = require('../lib/util')

function compile (root, path, settings, setup) {
  if (typeof settings == 'function') {
    setup = settings
    settings = null
  }
  new Compile(root, path, settings).use(setup).exec()
}

describe('Compile', function () {
  var fs, log

  beforeEach(function () {
    fs = new Fs
    fs.patch()
    log = Log()
  })

  afterEach(function () {
    fs.unpatch()
  })

  describe('Traversed file', function () {
    it('Should have right properties', function (done) {
      fs.file('root/subdir/foo.txt', 'hello')
      compile('root', '.', function () {
        this.on('traverse', function (f) {
          f.name.should.equal('subdir/foo')
          f.ext.should.equal('.txt')
          f.stat.isFile().should.be.true
          f.path.should.equal('root/subdir/foo.txt')
          f.read().should.equal('hello')
          done()
        })
      })
    })

    it('"as" setting should be respected', function (done) {
      fs.file('subdir/app.js')
      compile('.', 'subdir', function () {
        this.as = 'super'
        this.on('traverse', function (f) {
          f.name.should.equal('super/app')
          done()
        })
      })
    })
  })

  it('Should traverse all non-excluded files', function () {
    fs.file('bar/baz/app.js')
      .file('bar/index.txt')
      .file('foo/init.backend.js')

    compile('.', '.', function () {
      this.exclude('*backend*')
      this.on('traverse', function (f) {
        log(f.name)
      })
    })

    log.should
      .include('bar/baz/app')
      .include('bar/index')
      .not.include('backend')
  })

  it('Should compile all registered file types', function () {
    fs.file('bar/baz/foo.js', 'foo')
      .file('hello.html', 'hello')

    compile('.', '.', function () {
      this.ext('.js', function (s) {
        return 'js::' + s
      })
      this.ext('.html', function (s) {
        return 'html::' + s
      })
      this.on('out', function (f) {
        log(f.out())
      })
    })

    log.should
      .include('js::foo')
      .include('html::hello')
  })

  it('Should inherit excludes from settings', function () {
    fs.file('bar/baz.txt')
    var settings = util.use.call({}, util.Exclude)
    settings.exclude('*.txt')
    compile('.', '.', settings, function () {
      this.on('traverse', function () {
        throw new Error('failed')
      })
    })
  })

  it('Should inherit extensions from settings', function (done) {
    fs.unpatch()
    util.compiler('plain') // TODO: fix fs patching
    fs.patch()
    fs.file('bar/baz.txt')
    var settings = util.use.call({}, util.Extensions)
    settings.ext('.txt', 'plain')
    compile('.', '.', settings, function () {
      this.on('out', function (f) {
        done()
      })
    })
  })
})