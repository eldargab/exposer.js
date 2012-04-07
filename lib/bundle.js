var req = require('client-require')

module.exports = Bundle

function Bundle (name) {
    this.name = name
    this.mtime = 0
    this.modules = []
    this.packages = []
}

Bundle.prototype.add = function (m) {
    if (m.mtime > this.mtime) this.mtime = m.mtime
    m.isPackage
        ? this.packages.push(m)
        : this.modules.push(m)
}

Bundle.prototype.toString = function () {
    var s = ''

    this.packages.forEach(function (p) {
        s += req.wrapPackage(p.name, p.main)
    })

    this.modules.forEach(function (m) {
        s += '\n' + req.wrapModule(m.name, m.src(), m.requires())
    })

    return s
}