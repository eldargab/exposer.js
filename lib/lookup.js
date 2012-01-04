var fs = require('fs');
var PATH = require('path');

module.exports = function lookup (path, visitors, filter) {
    filter = filter || function () { return true };

    var stats = fs.statSync(path);

    if (!filter(path, stats)) return;

    var visitor = stats.isFile() ? fileVisitor(path) : 'visitDirectory';

    if (visitors[visitor])
        visitors[visitor](path);

    if (stats.isDirectory()) {
        fs.readdirSync(path).forEach(function (item) {
            lookup(PATH.join(path, item), visitors, filter);
        });
    }
}

function fileVisitor (file) {
    var ext = PATH.extname(file).substring(1).replace(/^./, function (firstLetter) {
        return firstLetter.toUpperCase();
    });
    return 'visit' + ext + 'File';
}
