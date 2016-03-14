/**
	Copies HTML to destination folder
	TODO: Make this smarter and have it build the relevant paths into <script> tags automagically
*/
var gulp 	= require('gulp');
var config 	= require('../config').html;

gulp.task('html', function(){
	return gulp.src( config.src )
		.pipe(gulp.dest( config.dest ));
});