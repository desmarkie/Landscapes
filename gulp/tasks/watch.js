/**
	Watch tasks for each script process
	TODO: look at removing the need to add these manually
*/
var gulp 	= require('gulp');
var config 	= require('../config');

gulp.task('watch', function(){
	gulp.watch(	config.html.src , ['html'] );
	gulp.watch(	config.scripts.coffee.src , ['scripts'] );
	gulp.watch(	config.assets.images.src, ['images'] );
	gulp.watch(	config.assets.json.src, ['json'] );
	gulp.watch(	config.assets.fonts.src, ['fonts'] );
	gulp.watch(	config.assets.sounds.src, ['sounds'] );
	gulp.watch(	config.scripts.libs.neutral.src, ['neutrallibs'] );
	gulp.watch(	config.scripts.libs.vendors.src, ['vendorlibs'] );
});