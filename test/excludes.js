var util = require('../lib/util')
var matched = true
var Exclude = function () {
  return Object.create(util.Exclude)
}

describe('Exclude patterns', function () {
  test('/foo/', 'hello/foo/')
  test('foo/', 'hello/foo/', matched)
  test('/foo/', 'foo/', matched)
  test('/foo/', 'foo')
  test('*.json', 'package.json', matched)

  it('Should work with RegExp', function () {
    var ex = Exclude()
    ex.exclude(/hello/)
    ex.isExcluded('hello').should.be.true
  })

  it('Should work with function', function () {
    var ex = Exclude()
    ex.exclude(function (p) {
      return p.indexOf('bar') > 0
    })
    ex.isExcluded('bar').should.be.true
  })

  describe('Should exclude by default', function () {
    it('bin/', function () {
      assert(Exclude(), 'bin/', matched)
    })
    it('dot files', function () {
      assert(Exclude(), '.hello', matched)
    })
    it('test/', function () {
      assert(Exclude(), 'test/', matched)
    })
  })
})

function test (pattern, path, match) {
  it(pattern + ' should' + (match ? '' : ' NOT') + ' match ' + path, function () {
    var ex = Exclude()
    ex.exclude(pattern)
    assert(ex, path, match)
  })
}

function assert (ex, path, match) {
  var isDir = !!/\/$/.exec(path)
  if (isDir) path = path.slice(0, path.length - 1)
  ex.isExcluded(path, isDir).should.equal(!!match)
}