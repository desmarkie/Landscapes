/**
	Task to start local server instance
*/
var gulp 	= require('gulp');
var connect = require('gulp-connect');
var config 	= require('../config').connect;

gulp.task('connect', function(){
	connect.server( config );
});