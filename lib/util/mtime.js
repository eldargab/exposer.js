var tryStat = require('./try-stat')

module.exports = function mtime (path) {
    var stat = tryStat(path)
    return stat ? stat.mtime : 0
}