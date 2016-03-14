/**
	Task to copy assets from source to relevant build folders
	TODO: Run a 'newer' check on assets to see if replacement is needed
*/
var gulp 	= require('gulp');
var config 	= require('../config').assets;

gulp.task( 'images', function(){
	
	//copy image assets
	return gulp.src( config.images.src )
		.pipe(gulp.dest( config.images.dest ));

});

gulp.task( 'fonts', function(){

	//copy image assets
	return gulp.src( config.fonts.src )
		.pipe(gulp.dest( config.fonts.dest ));

});

gulp.task( 'json', function(){

	//copy json assets
	return gulp.src( config.json.src )
		.pipe(gulp.dest( config.json.dest ));

});

gulp.task( 'sounds', function(){

	//copy sounds assets
	return gulp.src( config.sounds.src )
		.pipe(gulp.dest( config.sounds.dest ));

});
