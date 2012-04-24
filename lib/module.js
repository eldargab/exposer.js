module.exports = Module

function Module (name, read, mtime) {
    this.name = name
    this._read = read
    this.mtime = mtime
}

Module.prototype.src = function () {
    if (this._src) return this._src
    return this._src = this._read()
}

Module.prototype.requires = function () {
    var deps = [];

    this.src()
        .replace( /(\/\*([\s\S]*?)\*\/|\/\/(.*)$)/mg, '') // remove comments
        .replace(/require\(\s*["']([^'"\s]+)["']\s*\)/g, function (match, dependency) {
            deps.push(dependency);
            return match;
        });

    return deps;
}