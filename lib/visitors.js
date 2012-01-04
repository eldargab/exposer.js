var PATH = require('path');
var fs = require('fs');
var jsCommentRegex = /(\/\*([\s\S]*?)\*\/|\/\/(.*)$)/mg;
var jsRequireRegex = /require\(\s*["']([^'"\s]+)["']\s*\)/g;

module.exports = Visitors;

function Visitors (root, target) {
    this.root = root;
    this.target = target;
}

Visitors.prototype.visitJsFile = function (file) {
    var relativePath = PATH.relative(this.root, file);
    var jsString = fs.readFileSync(file, 'utf8');
    var requires = [];

    jsString
        .replace(jsCommentRegex, '')
        .replace(jsRequireRegex, function (match, dependency) {
            requires.push(dependency);
            return match;
        });

    var clientModuleName = normalizeName(relativePath);

    var clientJs =  "require.register('" + clientModuleName + "', "
        + "[" + requires.map(function (dep) { return "'" + dep + "'" }).join() + "], "
        + "function (exports, module, require) {"
        + jsString + "});";

    this._saveFile(relativePath, clientJs);
}

Visitors.prototype.visitDirectory = function (dir) {
    var self = this;

    var packJson = PATH.join(dir, 'package.json');
    if (PATH.existsSync(packJson)) {
        var config = JSON.parse(fs.readFileSync(packJson, 'utf8'));
        if (config.main) {
            _reg(config.main);
            return;
        }
    }

    var indexJs = PATH.join(dir, 'index.js');
    if (PATH.existsSync(indexJs)) {
        _reg('index.js');
        return;
    }

    function _reg (main) {
        var relativePath = normalizeName(PATH.relative(self.root, dir));
        var registerJs = "require.registerPackage('" + relativePath + "', '" + main + "');";
        self._saveFile(PATH.join(relativePath, 'register-package'), registerJs);
    }
}

Visitors.prototype._saveFile = function (path, string) {
    var targetPath = PATH.resolve(this.target, path);
    var targetDir = PATH.dirname(targetPath);
    ensureDir(targetDir);
    fs.writeFileSync(targetPath, string);
}

function normalizeName (name) {
    return name.replace(/\\/g, '/');
}

function ensureDir (dir) {
    if (PATH.existsSync(dir))
        return;
    var baseDir = PATH.dirname(dir);
    ensureDir(baseDir);
    fs.mkdirSync(dir);
}
