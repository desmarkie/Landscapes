/**
	Default Gulp task
	
	Defines task lists for libs + assets
	These are left here so can customise on each project instance

	Default runs a build, watches sources and then instantiates local test server
*/
var gulp = require('gulp');

gulp.task('libs', ['neutrallibs', 'vendorlibs']);
gulp.task('assets', ['images', 'json', 'fonts', 'sounds']);

gulp.task('default', ['build', 'watch', 'connect']);