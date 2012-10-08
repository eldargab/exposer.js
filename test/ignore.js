var Ignore = require('../lib/util').Ignore
var matched = true

describe('Ignore patterns', function () {
  test('bin/', '/hello/bin/', matched)
  test('/bin/', '/hello/bin/')
  test('/bin/', '/bin/', matched)
  test('/bin/', '/bin')
  test('*.json', '/package.json', matched)

  it('Should work with RegExp', function () {
    var i = new Ignore('/')
    i.add(/hello/)
    i.match('hello').should.be.true
  })
})

function test (pattern, path, match) {
  it(pattern + ' should' + (match ? '' : ' NOT') + ' match ' + path, function () {
    var i = new Ignore('/')
    i.add(pattern)
    var isDir = !!/\/$/.exec(path)
    if (isDir) path = path.slice(0, path.length - 1)
    i.match(path, isDir).should.equal(!!match)
  })
}