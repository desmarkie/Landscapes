#Gulp + Browserify + Coffeescript
###Project Template (v2)


Empty project template for quick start of JS projects built using Coffeescript.
It's currently specific to internal Neutral Digital use but could be tidied up to provide a more generic and reusable template.  


The Gulp setup is based on the example here:  
https://viget.com/extend/gulp-browserify-starter-faq

####Requirements
[NodeJS](https://nodejs.org), NPM

####Reference
[Gulp](http://gulpjs.com/)  
[Browserify](http://browserify.org/)  
[CoffeeScript](http://coffeescript.org/)

##Main Usage
In terminal run `npm install` to install the local dependencies.  
Once the packages are installed run `gulp` to start building from the source and watching the source folders.  
Gulp-connect will start a local server at [http://localhost:9000](http://localhost:9000)

####Coffeescript
`src/coffee` is the location for coffeescript files. The default entry point is set to `src/coffee/index.coffee` but can be set within the config file located at `gulp/config.js`.  
See `scripts.coffee.index` within the module exports.  

####Libraries
Internal libraries should be added to `src/libs/neutral` and will be deployed to `build/js/libs`  
External libraries belong in `src/libs/vendors` and are deployed to `build/js/vendors`  

####Assets
`src/assets` contains folders for each asset type. Images can be located within subfolders for ease of project management.  

###Todo:
Separate deploy process with hooks for uglifying processed javascript
Use of gulp-newer or gulp-changed to make sure only relevant files are rebuilt on updates