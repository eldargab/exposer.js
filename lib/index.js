var fs = require('fs');
var PATH = require('path');
var lookup = require('./lookup');
var Visitors = require('./Visitors');

exports.expose = function expose (package, root, target) {
    var visitors = new Visitors(root, target);

    function filter (path) {
        var name = PATH.basename(path);
        if (name == 'test' || name == 'bin')
            return false;
        return true;
    }

    lookup(package, visitors, filter);
}
