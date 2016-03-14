/**
	Main build task
	Browserify with Coffeescript transforms
	Based on example here: https://gist.github.com/shuhei/8418970
*/
var gulp 		= require('gulp');
var browserify 	= require('gulp-browserify');
var concat 		= require('gulp-concat');
var config 		= require('../config').scripts;

function handleError(err){
	console.log(err);
}

gulp.task( 'scripts', function()
{
	return gulp.src( config.coffee.index, {read: false} )
			   .pipe(browserify( {transform: ['coffeeify'], extensions: ['.coffee']} ).on('error', handleError))
			   .pipe(concat( config.coffee.outputName ))
			   .pipe(gulp.dest( config.coffee.dest ));
});