(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var ColourConversion, GridMapColour;

ColourConversion = require('./utils/ColourConversion');

GridMapColour = (function() {
  function GridMapColour() {
    this.landscapeColours = [0x3782C9, 0x65C0E5, 0xFFF29C, 0x3FDE4E, 0x24C21D];
    this.heightBreaks = [0.05, 0.2, 0.5, 0.8];
    this.blend = true;
    this.blendDistance = 1;
    this.addNoise = true;
    this.gaussian = false;
    this.gaussianPasses = 1;
    this.fade = false;
  }

  GridMapColour.prototype.applyColourToGrid = function(grid) {
    var col, h, i, j, k, l, ref, ref1, ref2, w, x, y;
    h = grid.width;
    w = grid.height;
    for (y = j = 0, ref = h; 0 <= ref ? j < ref : j > ref; y = 0 <= ref ? ++j : --j) {
      for (x = k = 0, ref1 = w; 0 <= ref1 ? k < ref1 : k > ref1; x = 0 <= ref1 ? ++k : --k) {
        if (this.fade) {
          col = Math.round(255 * grid.grid[y][x].value);
          grid.grid[y][x].colour = ColourConversion.rgbToHex([col, col, col]);
        } else {
          grid.grid[y][x].colour = this.calculateTileColour(grid.grid[y][x].value);
        }
      }
    }
    if (this.blend) {
      this.fadeHeights(grid);
    }
    if (this.gaussian) {
      for (i = l = 0, ref2 = this.gaussianPasses; 0 <= ref2 ? l < ref2 : l > ref2; i = 0 <= ref2 ? ++l : --l) {
        this.smoothValues(grid);
      }
    }
    if (this.addNoise) {
      this.addNoiseToColours(grid);
    }
    return null;
  };

  GridMapColour.prototype.calculateTileColour = function(tileValue) {
    var i, j, ref;
    for (i = j = 0, ref = this.heightBreaks.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
      if (tileValue <= this.heightBreaks[i]) {
        return this.landscapeColours[i];
      }
    }
    return this.landscapeColours[this.landscapeColours.length - 1];
  };

  GridMapColour.prototype.addNoiseToColours = function(grid) {
    var h, j, k, ran, ref, ref1, res, src, w, x, y;
    h = grid.width;
    w = grid.height;
    ran = 0;
    src = 0;
    res = 0;
    for (y = j = 0, ref = h; 0 <= ref ? j < ref : j > ref; y = 0 <= ref ? ++j : --j) {
      for (x = k = 0, ref1 = w; 0 <= ref1 ? k < ref1 : k > ref1; x = 0 <= ref1 ? ++k : --k) {
        src = ColourConversion.hexToRgb(grid.grid[y][x].colour);
        ran = Math.round((Math.random() * 255) / 20);
        res = [[src[0] + ran], [src[1] + ran], [src[2] + ran]];
        if (res[0] > 255) {
          res[0] = 255;
        }
        if (res[1] > 255) {
          res[1] = 255;
        }
        if (res[2] > 255) {
          res[2] = 255;
        }
        grid.grid[y][x].colour = ColourConversion.rgbToHex(res);
      }
    }
    return null;
  };

  GridMapColour.prototype.getNeighbourAverage = function(x, y, grid) {
    var b, g, gridArr, j, len, newColour, r;
    gridArr = [];
    gridArr.push(ColourConversion.hexToRgb(grid.grid[x - 1][y - 1].colour));
    gridArr.push(ColourConversion.hexToRgb(grid.grid[x - 1][y].colour));
    gridArr.push(ColourConversion.hexToRgb(grid.grid[x - 1][y + 1].colour));
    gridArr.push(ColourConversion.hexToRgb(grid.grid[x][y - 1].colour));
    gridArr.push(ColourConversion.hexToRgb(grid.grid[x][y + 1].colour));
    gridArr.push(ColourConversion.hexToRgb(grid.grid[x + 1][y - 1].colour));
    gridArr.push(ColourConversion.hexToRgb(grid.grid[x + 1][y].colour));
    gridArr.push(ColourConversion.hexToRgb(grid.grid[x + 1][y + 1].colour));
    r = 0;
    g = 0;
    b = 0;
    for (j = 0, len = gridArr.length; j < len; j++) {
      grid = gridArr[j];
      r += grid[0];
      g += grid[1];
      b += grid[2];
    }
    r /= 8;
    g /= 8;
    b /= 8;
    newColour = ColourConversion.rgbToHex([r, g, b]);
    return newColour;
  };

  GridMapColour.prototype.adjustHeightValue = function(x, y, grid) {
    var gridArr, higherColour, middleColour, sourceColour, sourceRGB, targetRGB;
    sourceColour = grid.grid[x][y].colour;
    higherColour = grid.grid[x][y].colour;
    if (sourceColour === this.landscapeColours['4']) {
      return this.landscapeColours['4'];
    } else if (sourceColour === this.landscapeColours['3']) {
      higherColour = this.landscapeColours['4'];
    } else if (sourceColour === this.landscapeColours['2']) {
      higherColour = this.landscapeColours['3'];
    } else if (sourceColour === this.landscapeColours['1']) {
      higherColour = this.landscapeColours['2'];
    } else if (sourceColour === this.landscapeColours['0']) {
      higherColour = this.landscapeColours['1'];
    }
    gridArr = [];
    gridArr.push(grid.grid[x - 1][y - 1].colour);
    gridArr.push(grid.grid[x - 1][y].colour);
    gridArr.push(grid.grid[x - 1][y + 1].colour);
    gridArr.push(grid.grid[x][y - 1].colour);
    gridArr.push(grid.grid[x][y + 1].colour);
    gridArr.push(grid.grid[x + 1][y - 1].colour);
    gridArr.push(grid.grid[x + 1][y].colour);
    gridArr.push(grid.grid[x + 1][y + 1].colour);
    if (gridArr.indexOf(higherColour) === -1) {
      return sourceColour;
    }
    middleColour = [];
    sourceRGB = ColourConversion.hexToRgb(sourceColour);
    targetRGB = ColourConversion.hexToRgb(higherColour);
    middleColour[0] = sourceRGB[0] + ((targetRGB[0] - sourceRGB[0]) * 0.5);
    middleColour[1] = sourceRGB[1] + ((targetRGB[1] - sourceRGB[1]) * 0.5);
    middleColour[2] = sourceRGB[2] + ((targetRGB[2] - sourceRGB[2]) * 0.5);
    return ColourConversion.rgbToHex(middleColour);
  };

  GridMapColour.prototype.fadeHeights = function(grid) {
    var curPoint, j, k, l, m, ref, ref1, ref2, ref3, smoothedColours, x, y;
    curPoint = null;
    smoothedColours = {};
    for (y = j = 1, ref = grid.height - 1; 1 <= ref ? j < ref : j > ref; y = 1 <= ref ? ++j : --j) {
      for (x = k = 1, ref1 = grid.width - 1; 1 <= ref1 ? k < ref1 : k > ref1; x = 1 <= ref1 ? ++k : --k) {
        curPoint = grid.grid[x][y];
        smoothedColours[x + '_' + y] = this.adjustHeightValue(x, y, grid);
      }
    }
    for (y = l = 1, ref2 = grid.height - 1; 1 <= ref2 ? l < ref2 : l > ref2; y = 1 <= ref2 ? ++l : --l) {
      for (x = m = 1, ref3 = grid.width - 1; 1 <= ref3 ? m < ref3 : m > ref3; x = 1 <= ref3 ? ++m : --m) {
        grid.grid[x][y].colour = smoothedColours[x + '_' + y];
      }
    }
    return null;
  };

  GridMapColour.prototype.smoothValues = function(grid) {
    var avg, avgColours, curPoint, j, k, l, m, ref, ref1, ref2, ref3, x, y;
    curPoint = null;
    avgColours = {};
    for (y = j = 1, ref = grid.height - 1; 1 <= ref ? j < ref : j > ref; y = 1 <= ref ? ++j : --j) {
      for (x = k = 1, ref1 = grid.width - 1; 1 <= ref1 ? k < ref1 : k > ref1; x = 1 <= ref1 ? ++k : --k) {
        curPoint = grid.grid[x][y];
        avg = this.getNeighbourAverage(x, y, grid);
        avgColours[x + '_' + y] = avg;
      }
    }
    for (y = l = 1, ref2 = grid.height - 1; 1 <= ref2 ? l < ref2 : l > ref2; y = 1 <= ref2 ? ++l : --l) {
      for (x = m = 1, ref3 = grid.width - 1; 1 <= ref3 ? m < ref3 : m > ref3; x = 1 <= ref3 ? ++m : --m) {
        grid.grid[x][y].colour = avgColours[x + '_' + y];
      }
    }
    return null;
  };

  return GridMapColour;

})();

module.exports = GridMapColour;


},{"./utils/ColourConversion":7}],2:[function(require,module,exports){
var GridMapGen, Peak;

Peak = require('./Peak');

GridMapGen = (function() {
  function GridMapGen() {
    this.grid = [];
    this.width = 64;
    this.height = 64;
    this.centers = [];
    this.numberOfCenters = 26;
    this.randomExtraCenters = true;
    this.numberOfRandomExtraCenters = 16;
    this.centerPad = 10;
    this.normalise = true;
    this.wobble = true;
    this.wobbleAmount = 0.3;
    this.wobbleCount = 6;
  }

  GridMapGen.prototype.getMax = function() {
    var j, k, max, min, ref, ref1, x, y;
    min = 1;
    max = 0;
    for (y = j = 0, ref = this.height; 0 <= ref ? j < ref : j > ref; y = 0 <= ref ? ++j : --j) {
      for (x = k = 0, ref1 = this.width; 0 <= ref1 ? k < ref1 : k > ref1; x = 0 <= ref1 ? ++k : --k) {
        if (this.grid[y][x].value < min) {
          min = this.grid[y][x].value;
        }
        if (this.grid[y][x].value > max) {
          max = this.grid[y][x].value;
        }
      }
    }
    return max;
  };

  GridMapGen.prototype.squareDistanceBetweenTwoPoints = function(ptA, ptB) {
    var distSq, xDist, yDist;
    xDist = ptB.position.x - ptA.position.x;
    yDist = ptB.position.y - ptA.position.y;
    distSq = (xDist * xDist) + (yDist * yDist);
    return distSq;
  };

  GridMapGen.prototype.getMinimumDistanceFromCenters = function(x, y, points) {
    var distSq, halfWidthSq, j, len, point;
    distSq = 10000;
    for (j = 0, len = points.length; j < len; j++) {
      point = points[j];
      distSq = Math.min(distSq, this.squareDistanceBetweenTwoPoints({
        position: {
          x: x,
          y: y
        }
      }, point));
    }
    halfWidthSq = (this.width * 0.5) * (this.width * 0.5);
    distSq /= halfWidthSq;
    return distSq;
  };

  GridMapGen.prototype.getAverageDistanceFromACenter = function(x, y, points) {
    var distSq, halfWidthSq, j, len, point;
    distSq = 0;
    for (j = 0, len = points.length; j < len; j++) {
      point = points[j];
      distSq += this.squareDistanceBetweenTwoPoints({
        position: {
          x: x,
          y: y
        }
      }, point);
    }
    distSq /= points.length;
    halfWidthSq = (this.width * 0.5) * (this.width * 0.5);
    distSq /= halfWidthSq;
    return distSq;
  };

  GridMapGen.prototype.pickRandomCenter = function(minX, minY, maxX, maxY) {
    var peak, ranX, ranY;
    ranX = minX + (Math.floor(Math.random() * (maxX - minX)));
    ranY = minY + (Math.floor(Math.random() * (maxY - minY)));
    peak = new Peak();
    peak.position.x = ranX;
    peak.position.y = ranY;
    peak.falloff = 3 + (17 * Math.random());
    peak.height = 0.5 + Math.random();
    return peak;
  };

  GridMapGen.prototype.getHeightFromPeak = function(x, y, peak) {
    var dist, val, xDif, yDif;
    val = 0;
    xDif = peak.position.x - x;
    yDif = peak.position.y - y;
    dist = Math.sqrt((xDif * xDif) + (yDif * yDif));
    if (dist < peak.falloff) {
      val = peak.height * (1 - (dist / peak.falloff));
    }
    return val;
  };

  GridMapGen.prototype.calculateCombinedHeight = function(x, y, points) {
    var j, len, point, val;
    val = 0;
    for (j = 0, len = points.length; j < len; j++) {
      point = points[j];
      val += this.getHeightFromPeak(x, y, point);
    }
    if (val < 0) {
      console.log(x, y);
    }
    return val;
  };

  GridMapGen.prototype.pointIsACenterPoint = function(x, y, points) {
    var j, len, point, val;
    val = false;
    for (j = 0, len = points.length; j < len; j++) {
      point = points[j];
      if (point.position.x === x && point.position.y === y) {
        val = true;
      }
    }
    return val;
  };

  GridMapGen.prototype.getWobble = function() {
    var amt, i, j, ref;
    amt = 0;
    for (i = j = 0, ref = this.wobbleCount; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
      amt += Math.random() * this.wobbleAmount;
    }
    return amt;
  };

  GridMapGen.prototype.normaliseValues = function(min, max) {
    var j, k, ref, ref1, x, y;
    this.max = max;
    for (y = j = 0, ref = this.height; 0 <= ref ? j < ref : j > ref; y = 0 <= ref ? ++j : --j) {
      for (x = k = 0, ref1 = this.width; 0 <= ref1 ? k < ref1 : k > ref1; x = 0 <= ref1 ? ++k : --k) {
        this.grid[y][x].value /= max;
      }
    }
    return null;
  };

  GridMapGen.prototype.generateMap = function() {
    var i, j, k, l, maxValue, minValue, numCenters, ref, ref1, ref2, value, x, y;
    numCenters = this.numberOfCenters;
    if (this.randomExtraCenters) {
      numCenters += Math.round(Math.random() * this.numberOfRandomExtraCenters);
    }
    this.centers = [];
    for (i = j = 0, ref = numCenters; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
      this.centers.push(this.pickRandomCenter(this.centerPad, this.centerPad, this.width - this.centerPad, this.height - this.centerPad));
    }
    this.grid = [];
    value = 0;
    minValue = 1;
    maxValue = 0;
    for (y = k = 0, ref1 = this.height; 0 <= ref1 ? k < ref1 : k > ref1; y = 0 <= ref1 ? ++k : --k) {
      this.grid[y] = [];
      for (x = l = 0, ref2 = this.width; 0 <= ref2 ? l < ref2 : l > ref2; x = 0 <= ref2 ? ++l : --l) {
        if ((x < 1 || x > this.width - 2) || (y < 1 || y > this.height - 2)) {
          value = 0;
        } else {
          value = this.calculateCombinedHeight(x, y, this.centers);
        }
        if (this.wobble) {
          value -= this.getWobble();
        }
        if (value < minValue) {
          minValue = value;
        }
        if (value > maxValue) {
          maxValue = value;
        }
        this.grid[y][x] = {
          id: x + '_' + y,
          x: x,
          y: y,
          value: value
        };
      }
    }
    if (this.normalise) {
      this.normaliseValues(minValue, maxValue);
    }

    /*
    		value = null
    		distSq = 0
    		@grid = []
    
    		for y in [0...@height]
    			@grid[y] = []
    			for x in [0...@width]
    				#center point is the highest point
    				if @pointIsACenterPoint x, y, centers
    					value = 1 #@landscapeColours['5']
    				#edge is always lowest possible value
    				else if ( x < 1 or x > @width-2 ) or ( y < 1 or y > @height-2 )
    					value = 0 #@landscapeColours['0']
    				#get the ratio between 0 and 5 for land colour
    				else
    					#straight distance = smooth circle
    					distSq = @getMinimumDistanceFromCenters x, y, centers
    					if distSq > 1 then distSq = 1
    					if distSq < 0 then distSq = 0
    
    					distSq = Math.abs(Math.log(distSq) / 7)
    
    					if @wobble then distSq -= @getWobble()
    
    					value = distSq
    
    				@grid[y][x] = {id:x+'_'+y, x:x, y:y, value:value}
     */
    return null;
  };

  return GridMapGen;

})();

module.exports = GridMapGen;


},{"./Peak":4}],3:[function(require,module,exports){
var GridSprites,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

GridSprites = (function(superClass) {
  extend(GridSprites, superClass);

  function GridSprites() {
    GridSprites.__super__.constructor.call(this);
    this.pool = [];
    this.sprites = {};
    this.defaultTileSize = 64;
    this.tileSize = 12;
    this.border = false;
    this.debugClick = (function(_this) {
      return function(e) {
        return console.log('no debug');
      };
    })(this);
  }

  GridSprites.prototype.createGrid = function(gridData) {
    var h, i, j, ref, ref1, sp, w, x, y;
    this.clearCurrentGrid();
    w = gridData.width;
    h = gridData.height;
    this.sprites = {};
    for (y = i = 0, ref = h; 0 <= ref ? i < ref : i > ref; y = 0 <= ref ? ++i : --i) {
      for (x = j = 0, ref1 = w; 0 <= ref1 ? j < ref1 : j > ref1; x = 0 <= ref1 ? ++j : --j) {
        sp = this.sprites[x + '_' + y] = this.getTileSprite(x, y, gridData.data[y][x].colour);
        this.addChild(sp);
      }
    }
    this.position.x = (window.innerWidth - this.width) * 0.5;
    this.position.y = (window.innerHeight - this.height) * 0.5;
    return null;
  };

  GridSprites.prototype.clearCurrentGrid = function() {
    var sp;
    while (this.children.length > 0) {
      sp = this.getChildAt(0);
      this.removeChild(sp);
      this.pool.push(sp);
    }
    return null;
  };

  GridSprites.prototype.getTileSprite = function(xpos, ypos, colour) {
    var scale, sp;
    if (this.pool.length > 0) {
      sp = this.pool.splice(0, 1)[0];
    } else {
      sp = new PIXI.Graphics();
      sp.interactive = true;
      sp.on('mouseup', this.debugClick);
    }
    sp.clear();
    if (this.border) {
      sp.lineStyle(3, 0xFFFFFF, 0.3);
    }
    sp.beginFill(colour);
    sp.drawRect(0, 0, this.defaultTileSize, this.defaultTileSize);
    sp.endFill();
    sp.id = xpos + '_' + ypos;
    sp.position.x = xpos * this.tileSize;
    sp.position.y = ypos * this.tileSize;
    scale = this.tileSize / this.defaultTileSize;
    sp.scale.x = sp.scale.y = scale;
    return sp;
  };

  return GridSprites;

})(PIXI.Container);

module.exports = GridSprites;


},{}],4:[function(require,module,exports){
var Peak;

Peak = (function() {
  function Peak() {
    this.position = {
      x: 0,
      y: 0
    };
    this.falloff = 1;
    this.height = 1;
  }

  return Peak;

})();

module.exports = Peak;


},{}],5:[function(require,module,exports){
var App, GridMapColour, GridMapGen, GridSprites,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

GridSprites = require('./GridSprites');

GridMapGen = require('./GridMapGen');

GridMapColour = require('./GridMapColour');

App = (function() {
  function App() {
    this.update = bind(this.update, this);
    this.generateGridColours = bind(this.generateGridColours, this);
    this.generateGrid = bind(this.generateGrid, this);
  }

  App.prototype.init = function() {
    console.log('App Started!');
    this.colours = {
      white: 0xf2f2f2,
      red: 0xd95964,
      blue: 0x274073,
      lightBrown: 0xa6926d,
      darkBrown: 0x8c5a4f
    };
    this.lotsCount = 3;
    this.grid = new GridMapGen();
    this.mapColour = new GridMapColour();
    this.renderer = PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight);
    this.renderer.backgroundColor = this.mapColour.landscapeColours['0'];
    this.stage = new PIXI.Container();
    document.body.appendChild(this.renderer.view);
    this.gridSprites = new GridSprites();
    this.stage.addChild(this.gridSprites);
    this.gridSprites.debugClick = (function(_this) {
      return function(e) {
        var comH, maxH, norH, x, y;
        x = Math.floor(e.target.position.x / _this.gridSprites.tileSize);
        y = Math.floor(e.target.position.y / _this.gridSprites.tileSize);
        comH = _this.grid.calculateCombinedHeight(x, y, _this.grid.centers);
        maxH = _this.grid.max;
        norH = comH / maxH;
        console.log(x, y);
        console.log('combined height', comH);
        console.log('normalisedHeight', norH);
        return console.log('max height', maxH);
      };
    })(this);
    this.generateGrid();
    this.gui = new dat.GUI();
    this.gridProps = this.gui.addFolder('Map');
    this.gui.add(this, 'generateGrid').name("Generate");
    this.heights = this.gui.addFolder('Height Breaks');
    this.colours = this.gui.addFolder('Colours');
    this.extras = this.gui.addFolder('Extras');
    this.gridProps.add(this.grid, 'width', 8, 128).step(1).name('Grid Size').onChange((function(_this) {
      return function() {
        return _this.grid.height = _this.grid.width;
      };
    })(this));
    this.gridProps.add(this.gridSprites, 'tileSize', 2, 32).step(2).name('Tile Size');
    this.gridProps.add(this.grid, 'centerPad', 0, 64).step(1);
    this.gridProps.add(this.grid, 'numberOfCenters', 1, 99).step(1);
    this.gridProps.add(this.grid, 'randomExtraCenters');
    this.gridProps.add(this.grid, 'numberOfRandomExtraCenters', 1, 16).step(1).name('# extra centers');
    this.gridProps.add(this.grid, 'normalise').name('normalise values');
    this.gridProps.add(this.grid, 'wobble').name('distance noise');
    this.gridProps.add(this.grid, 'wobbleAmount', 0.05, 0.5).step(0.01).name('Wobble Amount');
    this.gridProps.add(this.grid, 'wobbleCount', 1, 20).step(1).name('Wobble Count');
    this.extras.add(this.mapColour, 'blend').onChange(this.generateGridColours);
    this.extras.add(this.mapColour, 'gaussian').onChange(this.generateGridColours);
    this.extras.add(this.mapColour, 'gaussianPasses', 1, 10).step(1).onChange(this.generateGridColours);
    this.extras.add(this.mapColour, 'addNoise').onChange(this.generateGridColours);
    this.extras.add(this.gridSprites, 'border').onChange(this.generateGridColours);
    this.extras.add(this.mapColour, 'fade').onChange(this.generateGridColours);
    this.moreStuff = this.extras.addFolder('more');
    this.moreStuff.add(this, 'lotsCount', 2, 50);
    this.moreStuff.add(this, 'drawLots');
    this.colours.addColor(this.mapColour.landscapeColours, '0').onChange((function(_this) {
      return function() {
        _this.renderer.backgroundColor = _this.mapColour.landscapeColours['0'];
        return _this.generateGridColours();
      };
    })(this));
    this.colours.addColor(this.mapColour.landscapeColours, '1').onChange(this.generateGridColours);
    this.colours.addColor(this.mapColour.landscapeColours, '2').onChange(this.generateGridColours);
    this.colours.addColor(this.mapColour.landscapeColours, '3').onChange(this.generateGridColours);
    this.colours.addColor(this.mapColour.landscapeColours, '4').onChange(this.generateGridColours);
    this.heights.add(this.mapColour.heightBreaks, '0', 0, 1).onChange(this.generateGridColours);
    this.heights.add(this.mapColour.heightBreaks, '1', 0, 1).onChange(this.generateGridColours);
    this.heights.add(this.mapColour.heightBreaks, '2', 0, 1).onChange(this.generateGridColours);
    return this.heights.add(this.mapColour.heightBreaks, '3', 0, 1).onChange(this.generateGridColours);
  };

  App.prototype.generateGrid = function() {
    this.grid.generateMap();
    this.generateGridColours();
    return null;
  };

  App.prototype.drawLots = function() {
    var amt, count, i, j, lscale, ref, scale, sp, tex, totalHeight, x, y;
    this.gridSprites.alpha = 0;
    this.lots = new PIXI.Container();
    this.stage.addChild(this.lots);
    count = this.lotsCount * this.lotsCount;
    x = 0;
    y = 0;
    amt = 64 * 12;
    scale = 0.2;
    totalHeight = (amt * this.lotsCount) * scale;
    lscale = window.innerHeight / totalHeight;
    if (lscale > 1) {
      lscale = 1;
    }
    this.lots.scale.x = this.lots.scale.y = lscale;
    this.lots.position.x = (window.innerWidth - (totalHeight * lscale)) * 0.5;
    this.lots.position.y = (window.innerHeight - (totalHeight * lscale)) * 0.5;
    for (i = j = 0, ref = count; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
      console.log('generating....', i);
      this.generateGrid();
      tex = new PIXI.RenderTexture(this.renderer, amt, amt);
      tex.render(this.gridSprites);
      sp = new PIXI.Sprite(tex);
      sp.scale.x = sp.scale.y = scale;
      sp.x = (amt * scale) * x;
      sp.y = (amt * scale) * y;
      x++;
      if (x === this.lotsCount) {
        console.log('bump');
        x = 0;
        y++;
      }
      this.lots.addChild(sp);
      this.renderer.render(this.stage);
    }
    return null;
  };

  App.prototype.generateGridColours = function() {
    this.mapColour.applyColourToGrid(this.grid);
    this.gridSprites.createGrid({
      width: this.grid.width,
      height: this.grid.height,
      data: this.grid.grid
    });
    this.update();
    return null;
  };

  App.prototype.update = function() {
    this.renderer.render(this.stage);
    return null;
  };

  return App;

})();

module.exports = App;


},{"./GridMapColour":1,"./GridMapGen":2,"./GridSprites":3}],6:[function(require,module,exports){
var App;

App = require('./app');

window.app = new App();

window.app.init();


},{"./app":5}],7:[function(require,module,exports){

/*
Colour conversion utils
Mostly nicked from the interwebs
Main source: http://blog.crondesign.com/2011/02/actionscriptjavascript-colour-mode.html
hsbToRgb conversion from: http://stackoverflow.com/questions/17242144/javascript-convert-hsb-hsv-color-to-rgb-accurately
 */
var ColourConversion;

ColourConversion = (function() {
  function ColourConversion() {}

  ColourConversion.hexToRgb = function(hex) {
    var rgb;
    rgb = [];
    rgb.push(hex >> 16);
    rgb.push(hex >> 8 & 0xFF);
    rgb.push(hex & 0xFF);
    return rgb;
  };

  ColourConversion.rgbToHex = function(rgb) {
    var hex;
    hex = rgb[0] << 16 ^ rgb[1] << 8 ^ rgb[2];
    return hex;
  };

  ColourConversion.hsbToRgb = function(hsb) {
    var b, check, f, g, h, i, p, q, r, s, t, v;
    h = hsb[0] / 360;
    s = hsb[1] / 100;
    v = hsb[2] / 100;
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    check = i % 6;
    if (check === 0) {
      r = v;
      g = t;
      b = p;
    }
    if (check === 1) {
      r = q;
      g = v;
      b = p;
    }
    if (check === 2) {
      r = p;
      g = v;
      b = t;
    }
    if (check === 3) {
      r = p;
      g = q;
      b = v;
    }
    if (check === 4) {
      r = t;
      g = p;
      b = v;
    }
    if (check === 5) {
      r = v;
      g = p;
      b = q;
    }
    return [r * 255, g * 255, b * 255];
  };

  ColourConversion.rgbToHsb = function(rgb) {
    var f, hue, i, sat, val, x;
    rgb[0] /= 255;
    rgb[1] /= 255;
    rgb[2] /= 255;
    x = Math.min(Math.min(rgb[0], rgb[1]), rgb[2]);
    val = Math.max(Math.max(rgb[0], rgb[1]), rgb[2]);
    if (x === val) {
      return [void 0, 0, val * 100];
    }
    if (x === rgb[0]) {
      f = rgb[1] - rgb[2];
    } else if (x === rgb[1]) {
      f = rgb[2] - rgb[0];
    } else {
      f = rgb[0] - rgb[1];
    }
    if (x === rgb[0]) {
      i = 3;
    } else if (x === rgb[1]) {
      i = 5;
    } else {
      i = 1;
    }
    hue = Math.floor((i - f / (val - x)) * 60) % 360;
    sat = Math.floor(((val - x) / val) * 100);
    val = Math.floor(val * 100);
    return [hue, sat, val];
  };

  ColourConversion.hsbToHex = function(hsb) {
    var rgb;
    rgb = ColourConversion.hsbToRgb(hsb);
    return ColourConversion.rgbToHex(rgb);
  };

  ColourConversion.hexToHsb = function(hex) {
    var rgb;
    rgb = ColourConversion.hexToRgb(hex);
    return ColourConversion.rgbToHsb(rgb);
  };

  return ColourConversion;

})();

module.exports = ColourConversion;


},{}]},{},[6])