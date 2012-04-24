module.exports = Package

function Package (name, main, mtime) {
    if (main.charAt(0) != '.' || main.charAt(0) != '/')
        main = './' + main;

    this.main = main
    this.name = name
    this.mtime = mtime
    this.isPackage = true
}