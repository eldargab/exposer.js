var Log = require('test-log')
var Fs = require('fake-fs')
var Compile = require('..').Compile

describe('Compile', function () {
  var fs, log, compile

  beforeEach(function () {
    fs = new Fs
    fs.patch()
    log = Log()
    compile = new Compile().use(function () {
      this.extensions['.js'] = function (s) {
        return s
      }
    })
  })

  afterEach(function () {
    fs.unpatch()
  })

  it('test traversal', function () {
    fs.file('bar/hello.js')
      .file('foo/world.js')
      .file('foo/x.txt')

    compile
      .add('bar')
      .add('foo', '.')
      .on('start', log.fn('start'))
      .on('end', log.fn('end'))
      .on('file', function (f) {
        log(f.name)
      })
      .exec()

    log.should.equal('start bar/hello world end')
  })

  it('test file event', function (done) {
    fs.file('foo.js', 'module.exports = "foo"')

    compile.add('.').on('file', function (f) {
      f.name.should.equal('foo')
      f.stat.isFile().should.be.true
      f.src().should.equal('module.exports = "foo"')
      f.path.should.equal('foo.js')
      f.ext.should.equal('.js')
      done()
    }).exec()
  })

  describe('lookup options', function () {
    it('as', function (done) {
      fs.file('foo/index.js')

      compile.add('foo', '.', {as: 'baz'}).on('file', function (f) {
        f.name.should.equal('baz/index')
        done()
      }).exec()
    })

    it('extensions', function () {
      fs.file('foo.js', 'js')
        .file('bar.coffee', 'coffee')

      compile.add('.', {
        extensions: {
          '.coffee': function () {
            return 'I am coffee'
          }
        }
      }).on('file', function (f) {
        log(f.name + '::' + f.src())
      }).exec()

      log.should.equal('foo::js bar::I am coffee')
    })

    it('excludes', function () {
      fs.file('foo.js')
      compile
        .add('.', {exclude: {'foo*': true}})
        .on('file', log.fn('fail'))
        .exec()
      log.should.be.empty
    })

    it('setup function', function (done) {
      fs.at('bar/baz')
        .file('template.tpl', 'hello')
        .file('foo.js')

      compile
        .add('.', function (arg1, arg2) {
          arg1.should.equal(1)
          arg2.should.equal(2)
          this.exclude('bar/')
        }, 1, 2)

        .add('bar', 'baz', function (arg1, arg2) {
          arg1.should.equal(1)
          arg2.should.equal(2)
          this.as = 'qux'
          this.extensions['.tpl'] = function (s) {
            s.should.equal('hello')
            return 'Hey, I am template'
          }
          this.exclude('foo*')
        }, 1, 2)

        .on('file', function (f) {
          f.name.should.equal('qux/template')
          f.src().should.equal('Hey, I am template')
          done()
        })
        .exec()
    })
  })
})