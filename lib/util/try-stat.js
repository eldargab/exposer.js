var fs = require('fs')

module.exports = function tryStat (path) {
    try {
        return fs.statSync(path)
    }
    catch (e) {
        if (e.code !== 'ENOENT') throw e
    }
    return null
}