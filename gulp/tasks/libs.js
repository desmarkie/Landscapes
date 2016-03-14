/**
	Copies libraries to build location
*/
var gulp 	= require('gulp');
var config 	= require('../config').scripts.libs;

gulp.task( 'neutrallibs', function(){
	return gulp.src( config.neutral.src )
			   .pipe(gulp.dest( config.neutral.dest ));
});

gulp.task( 'vendorlibs', function(){
	return gulp.src( config.vendors.src )
			   .pipe(gulp.dest( config.vendors.dest ));
});