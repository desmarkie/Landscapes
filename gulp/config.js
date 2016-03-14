var dest 	= 'build';
var src 	= 'src';

module.exports = {

	//html content to be copied to build folder
	html: {
		src: src + '/html/**',
		dest: dest
	},
	
	//process javascript & coffeescript
	scripts: {

		//ap source files
		coffee: {
			//emtry point for app
			index: src + '/coffee/index.coffee',
			//might be able to drop this now
			src: src + '/coffee/**/*.coffee',
			//destination for output
			dest: dest + '/js',
			//name of concatenated js
			outputName: 'app.js',
			opts: {
				bare: true
			}
		},

		//packaged libraries (internal & vendor)
		libs: {
			neutral: {
				src: src + '/libs/neutral/*.js',
				dest: dest + '/js/libs'
			},
			vendors: {
				src: src + '/libs/vendors/*.js',
				dest: dest + '/js/vendors'
			}
		}
	},

	//asset file management
	assets: {
		images: {
			src: src + '/assets/images/**/*.*',
			dest: dest + '/img'
		},

		json: {
			src: src + '/assets/json/*.json',
			dest: dest + '/json'
		},

		fonts: {
			src: src + '/assets/fonts/*.*',
			dest: dest + '/fonts'
		},

		sounds: {
			src: src + '/assets/sounds/*.*',
			dest: dest + '/sounds'
		}
	},

	//local server for testing
	connect: {
		root: dest,
		livereload: true,
		port: 9000,
		host: ''
	}
}