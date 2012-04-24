var mkdirp = require('mkdirp')
var PATH = require('path')
var fs = require('fs')

module.exports = function write (path, str) {
    try {
        mkdirp.sync(PATH.dirname(path))
    }
    catch (e) {
        if (e.code != 'EEXIST') throw e
    }
    fs.writeFileSync(path, str, 'utf8')
}