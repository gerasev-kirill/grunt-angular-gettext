var Extractor = require('angular-gettext-tools').Extractor;

var cleanString = function(string){
    return string.replace(/^[/\[\]\-\*\"\'\!\.\,\ :_=]+/g, '').replace(/[/\[\]\-\*\"\'\!\.\,\ :_=]+$/, '');
}


module.exports = function (grunt) {
    grunt.registerMultiTask('nggettext_extract', 'Extract strings from views', function () {
        var options = this.options();

        if (options.extensions) {
            for (var extension in options.extensions) {
                var strategy = options.extensions[extension];
                if (!Extractor.isValidStrategy(strategy)) {
                    grunt.log.error("Invalid strategy " + strategy + " for extension " + extension);
                }
            }
        }

        this.files.forEach(function (file) {
			var origAddString = Extractor.prototype.addString;
			Extractor.prototype.addString = function(file, string, plural, extractedComment){
				var cleaned = cleanString(string);
				var cleanedPlural = '';
				if (plural){
					cleanedPlural = cleanString(plural);
				}
				return origAddString.call(this, file, cleaned, cleanedPlural, extractedComment);
			}
            var extractor = new Extractor(options);
            var failed = false;

            file.src.forEach(function (filename) {
                grunt.log.debug("Extracting " + filename);
                try {
                    extractor.parse(filename, grunt.file.read(filename));
                } catch (e) {
                    console.log(e);
                    grunt.log.error(e.message);
                    failed = true;
                }
            });

            if (!failed) {
                grunt.file.write(file.dest, extractor.toString());
            }
        });
    });
};
