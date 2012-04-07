module.exports = {
    '.js': function (src) { return src },

    '.json': function (src) {
        return 'module.exports = ' + src;
    }
}
