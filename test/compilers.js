var create = require('..').compiler

function toJs (js) {
  var m = new Function('module', js)
  m.exports = {}
  m(m)
  return m.exports
}

describe('Compilers', function () {
  describe('jade', function () {
    it('test html', function () {
      var compile = create('jade', 'html', {
        name: 'tobi'
      })
      var html = compile('h1 #{name}\nh2 #{filename}', 'hello.jade')
      html.should.include('tobi')
      html.should.include('hello.jade')
    })
  })

  describe('minstache', function () {
    it('test html', function () {
      var compile = create('minstache', 'html', {
        name: 'tobi'
      })
      compile('{name}').should.equal('tobi')
    })

    it('test fn', function () {
      var compile = create('minstache', 'fn')
      var tpl = toJs(compile('{name}'))
      tpl({name: 'tobi'}).should.equal('tobi')
    })
  })

  describe('stylus', function () {
    it('test compiling', function () {
      var compile = create('stylus')
      compile('a\n  width 100px')
        .should.include('width: 100px')
    })

    it('test error', function () {
      var compile = create('stylus')
      ;(function () {
        compile('a', 'hello.styl')
      }).should.throw(/hello\.styl/)
    })

    it('test setup', function () {
      var compile = create('stylus', function () {
        this.define('width', 100)
      })
      compile('a\n  width width')
        .should.include('width: 100')
    })
  })
})