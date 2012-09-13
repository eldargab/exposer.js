var Fs = require('fake-fs')
var Log = require('test-log')
var Lookup = require('..').Lookup

describe('Lookup', function () {
  var fs, log

  beforeEach(function () {
    fs = new Fs
    fs.patch()
    log = Log()
  })

  afterEach(function () {
    fs.unpatch()
  })

  it('test traversal', function () {
    fs.file('root/subdir/foo.txt')
      .file('root/index.js')

    new Lookup('root')
      .on('start', log.fn('start'))
      .on('end', log.fn('end'))
      .on('dir', function (p) {
        log('dir::' + p)
      })
      .on('file', function (p, stat, ext) {
        stat.isFile().should.be.true
        log('file::' + p + '::' + ext)
      })
      .exec()
    log.should.match(/^start.*end$/)
    log.should.include('dir::root')
    log.should.include('dir::root/subdir')
    log.should.include('file::root/index.js::.js')
    log.should.include('file::root/subdir/foo.txt::.txt')
  })

  it('test filtering', function () {
    fs.file('index.js')
      .file('.gitignore')
      .file('bar/baz.coffee')

    new Lookup('.')
      .exclude('*.js', ['bar/', {'.*': false}])
      .on('file', function (p) {
        log(p)
      })
      .exec()
    log.should.equal('.gitignore')
  })

  it('Should exclude dotfiles, test/, bin/ by default', function () {
    fs.file('.gitignore')
      .file('test/hello')
      .file('bin/file')
      .file('readme')

    new Lookup('.').on('file', function (p) {
      log(p)
    }).exec()

    log.should.equal('readme')
  })
})