var Ignore = require('../lib/util/ignore')

function test (pattern, path) {
    var i = new Ignore('/')
    i.add(pattern)
    var isDir = false
    path = path.replace(/\/$/, function () {
        isDir = true
        return ''
    })
    var matched = i.match(path, isDir)
    return {
        matched: function () {
            matched.should.be.true
        },
        unmatched: function () {
            matched.should.be.false
        }
    }
}

describe('Ignore', function () {
    it('test', function () {
        test('bin/', 'hello/bin/').matched()
        test('/bin/', 'hello/bin/').unmatched()
        test('/bin/', '/bin/').matched()
        test('/bin/', '/bin').unmatched()
        test('*.json', '/package.json').matched()
    })
})
