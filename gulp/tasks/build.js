/**
	Main build task
	Runs each sub task in order
*/
var gulp = require('gulp');

gulp.task(
	'build', 
		['html', 
		'scripts', 
		'libs', 
		'assets']
);