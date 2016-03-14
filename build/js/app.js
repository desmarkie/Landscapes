(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var App, ColourConversion,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

ColourConversion = require('./utils/ColourConversion');

App = (function() {
  function App() {
    this.update = bind(this.update, this);
    this.generateGridColours = bind(this.generateGridColours, this);
  }

  App.prototype.init = function() {
    console.log('App Started!');
    this.defaultTileSize = 64;
    this.spritePool = [];
    this.colours = {
      white: 0xf2f2f2,
      red: 0xd95964,
      blue: 0x274073,
      lightBrown: 0xa6926d,
      darkBrown: 0x8c5a4f
    };
    this.landscapeColours = {
      0: 0x3782C9,
      1: 0x65C0E5,
      2: 0xFFF29C,
      3: 0x3FDE4E,
      4: 0x24C21D
    };
    this.renderer = PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight);
    this.renderer.backgroundColor = this.landscapeColours['0'];
    this.stage = new PIXI.Container();
    document.body.appendChild(this.renderer.view);
    this.gridDimensions = {
      width: 64,
      height: 64,
      spacing: 12,
      centers: 5,
      centerPad: 16,
      randomExtraCenters: true,
      numberOfRandomExtraCenters: 8,
      fadeValues: true,
      addNoise: true,
      gaussian: false,
      gaussianPasses: 3
    };
    this.heightBreaks = [0.15, 0.29, 0.48, 0.67];
    this.grid = [];
    this.gridSprites = [];
    this.gridContainer = new PIXI.Container();
    this.stage.addChild(this.gridContainer);
    this.generateGridColours();
    this.gui = new dat.GUI();
    this.gridProps = this.gui.addFolder('Grid');
    this.heights = this.gui.addFolder('Height Breaks');
    this.gridProps.add(this.gridDimensions, 'width', 8, 64).step(1).onChange((function(_this) {
      return function() {
        return _this.gridDimensions.height = _this.gridDimensions.width;
      };
    })(this));
    this.gridProps.add(this.gridDimensions, 'spacing', 2, 32).step(2);
    this.gridProps.add(this.gridDimensions, 'centers', 1, 99).step(1);
    this.gridProps.add(this.gridDimensions, 'centerPad', 0, 64).step(1);
    this.gridProps.add(this.gridDimensions, 'randomExtraCenters');
    this.gridProps.add(this.gridDimensions, 'numberOfRandomExtraCenters', 1, 16).step(1).name('# extra centers');
    this.gridProps.add(this.gridDimensions, 'fadeValues');
    this.gridProps.add(this.gridDimensions, 'addNoise');
    this.gridProps.add(this.gridDimensions, 'gaussian');
    this.gridProps.add(this.gridDimensions, 'gaussianPasses', 1, 10).step(1);
    this.heights.add(this.heightBreaks, '0', 0, 1);
    this.heights.add(this.heightBreaks, '1', 0, 1);
    this.heights.add(this.heightBreaks, '2', 0, 1);
    this.heights.add(this.heightBreaks, '3', 0, 1);
    this.gui.add(this, 'generateGridColours').name("Generate");
    return this.update();
  };

  App.prototype.generateGridColours = function() {
    var i, j, ref;
    this.createGrid();
    this.fillGrid();
    if (this.gridDimensions.gaussian) {
      for (i = j = 0, ref = this.gridDimensions.gaussianPasses; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
        this.smoothValues();
      }
    }
    if (this.gridDimensions.fadeValues) {
      this.fadeHeights();
    }
    if (this.gridDimensions.addNoise) {
      this.addNoise();
    }
    this.updateGridSprites();
    this.update();
    return null;
  };

  App.prototype.addNoise = function() {
    var j, k, ran, ref, ref1, res, src, x, y;
    ran = 0;
    src = 0;
    res = 0;
    for (y = j = 0, ref = this.gridDimensions.height; 0 <= ref ? j < ref : j > ref; y = 0 <= ref ? ++j : --j) {
      for (x = k = 0, ref1 = this.gridDimensions.width; 0 <= ref1 ? k < ref1 : k > ref1; x = 0 <= ref1 ? ++k : --k) {
        src = ColourConversion.hexToRgb(this.grid[x][y].colour);
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
        this.grid[x][y].colour = ColourConversion.rgbToHex(res);
      }
    }
    return null;
  };

  App.prototype.createGrid = function() {
    var j, k, ref, ref1, x, y;
    this.purgeGrid();
    for (y = j = 0, ref = this.gridDimensions.height; 0 <= ref ? j < ref : j > ref; y = 0 <= ref ? ++j : --j) {
      this.grid.push([]);
      for (x = k = 0, ref1 = this.gridDimensions.width; 0 <= ref1 ? k < ref1 : k > ref1; x = 0 <= ref1 ? ++k : --k) {
        this.grid[y].push({
          id: x + '_' + y,
          x: x,
          y: y,
          colour: null
        });
        this.gridSprites[x + '_' + y] = this.createGridSprite(x, y);
      }
    }
    this.gridContainer.position.x = (window.innerWidth - this.gridContainer.width) * 0.5;
    this.gridContainer.position.y = (window.innerHeight - this.gridContainer.height) * 0.5;
    return null;
  };

  App.prototype.purgeGrid = function() {
    var location, ref, sprite;
    ref = this.gridSprites;
    for (location in ref) {
      sprite = ref[location];
      this.gridContainer.removeChild(sprite);
      this.spritePool.push(sprite);
    }
    this.gridSprites = {};
    return null;
  };

  App.prototype.createGridSprite = function(xpos, ypos) {
    var scale, sp;
    if (this.spritePool.length > 0) {
      sp = this.spritePool.splice(0, 1)[0];
    } else {
      sp = new PIXI.Graphics();
      sp.lineStyle(1, this.colours.lightBrown);
      sp.beginFill(0, 0.1);
      sp.drawRect(0, 0, this.defaultTileSize, this.defaultTileSize);
      sp.endFill();
    }
    sp.id = xpos + '_' + ypos;
    sp.position.x = xpos * this.gridDimensions.spacing;
    sp.position.y = ypos * this.gridDimensions.spacing;
    scale = this.gridDimensions.spacing / this.defaultTileSize;
    sp.scale.x = sp.scale.y = scale;
    this.gridContainer.addChild(sp);
    return sp;
  };

  App.prototype.pickRandomCenter = function(minX, minY, maxX, maxY) {
    var ranX, ranY;
    ranX = minX + (Math.floor(Math.random() * (maxX - minX)));
    ranY = minY + (Math.floor(Math.random() * (maxY - minY)));
    return {
      x: ranX,
      y: ranY
    };
  };

  App.prototype.getNeighbourAverage = function(x, y) {
    var b, g, grid, gridArr, j, len, newColour, r;
    gridArr = [];
    gridArr.push(ColourConversion.hexToRgb(this.grid[x - 1][y - 1].colour));
    gridArr.push(ColourConversion.hexToRgb(this.grid[x - 1][y].colour));
    gridArr.push(ColourConversion.hexToRgb(this.grid[x - 1][y + 1].colour));
    gridArr.push(ColourConversion.hexToRgb(this.grid[x][y - 1].colour));
    gridArr.push(ColourConversion.hexToRgb(this.grid[x][y + 1].colour));
    gridArr.push(ColourConversion.hexToRgb(this.grid[x + 1][y - 1].colour));
    gridArr.push(ColourConversion.hexToRgb(this.grid[x + 1][y].colour));
    gridArr.push(ColourConversion.hexToRgb(this.grid[x + 1][y + 1].colour));
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

  App.prototype.adjustHeightValue = function(x, y) {
    var gridArr, higherColour, middleColour, sourceColour, sourceRGB, targetRGB;
    sourceColour = this.grid[x][y].colour;
    higherColour = this.grid[x][y].colour;
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
    gridArr.push(this.grid[x - 1][y - 1].colour);
    gridArr.push(this.grid[x - 1][y].colour);
    gridArr.push(this.grid[x - 1][y + 1].colour);
    gridArr.push(this.grid[x][y - 1].colour);
    gridArr.push(this.grid[x][y + 1].colour);
    gridArr.push(this.grid[x + 1][y - 1].colour);
    gridArr.push(this.grid[x + 1][y].colour);
    gridArr.push(this.grid[x + 1][y + 1].colour);
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

  App.prototype.fadeHeights = function() {
    var curPoint, j, k, l, m, ref, ref1, ref2, ref3, smoothedColours, x, y;
    curPoint = null;
    smoothedColours = {};
    for (y = j = 1, ref = this.gridDimensions.height - 1; 1 <= ref ? j < ref : j > ref; y = 1 <= ref ? ++j : --j) {
      for (x = k = 1, ref1 = this.gridDimensions.width - 1; 1 <= ref1 ? k < ref1 : k > ref1; x = 1 <= ref1 ? ++k : --k) {
        curPoint = this.grid[x][y];
        smoothedColours[x + '_' + y] = this.adjustHeightValue(x, y);
      }
    }
    for (y = l = 1, ref2 = this.gridDimensions.height - 1; 1 <= ref2 ? l < ref2 : l > ref2; y = 1 <= ref2 ? ++l : --l) {
      for (x = m = 1, ref3 = this.gridDimensions.width - 1; 1 <= ref3 ? m < ref3 : m > ref3; x = 1 <= ref3 ? ++m : --m) {
        this.grid[x][y].colour = smoothedColours[x + '_' + y];
      }
    }
    return null;
  };

  App.prototype.smoothValues = function() {
    var avg, avgColours, curPoint, j, k, l, m, ref, ref1, ref2, ref3, x, y;
    curPoint = null;
    avgColours = {};
    for (y = j = 1, ref = this.gridDimensions.height - 1; 1 <= ref ? j < ref : j > ref; y = 1 <= ref ? ++j : --j) {
      for (x = k = 1, ref1 = this.gridDimensions.width - 1; 1 <= ref1 ? k < ref1 : k > ref1; x = 1 <= ref1 ? ++k : --k) {
        curPoint = this.grid[x][y];
        avg = this.getNeighbourAverage(x, y);
        avgColours[x + '_' + y] = avg;
      }
    }
    for (y = l = 1, ref2 = this.gridDimensions.height - 1; 1 <= ref2 ? l < ref2 : l > ref2; y = 1 <= ref2 ? ++l : --l) {
      for (x = m = 1, ref3 = this.gridDimensions.width - 1; 1 <= ref3 ? m < ref3 : m > ref3; x = 1 <= ref3 ? ++m : --m) {
        this.grid[x][y].colour = avgColours[x + '_' + y];
      }
    }
    return null;
  };

  App.prototype.pointIsACenterPoint = function(x, y, points) {
    var j, len, point, val;
    val = false;
    for (j = 0, len = points.length; j < len; j++) {
      point = points[j];
      if (point.x === x && point.y === y) {
        val = true;
      }
    }
    return val;
  };

  App.prototype.calculateSquareDistanceFromMapCenter = function(x, y, center) {
    var distSq, halfWidthSq, xDist, yDist;
    xDist = center.x - x;
    yDist = center.y - y;
    distSq = (xDist * xDist) + (yDist * yDist);
    halfWidthSq = (this.gridDimensions.width * 0.5) * (this.gridDimensions.width * 0.5);
    return distSq / halfWidthSq;
  };

  App.prototype.getMinimumDistanceFromACenter = function(x, y, points) {
    var dist, j, len, point;
    dist = 0;
    for (j = 0, len = points.length; j < len; j++) {
      point = points[j];
      dist += this.calculateSquareDistanceFromMapCenter(x, y, point);
    }
    dist /= points.length;
    return dist;
  };

  App.prototype.fillGrid = function() {
    var centers, col, colour, distSq, i, j, k, l, m, numCenters, ref, ref1, ref2, val, wobble, x, y;
    numCenters = this.gridDimensions.centers;
    if (this.gridDimensions.randomExtraCenters) {
      numCenters += Math.round(Math.random() * this.gridDimensions.numberOfRandomExtraCenters);
    }
    centers = [];
    for (i = j = 0, ref = numCenters; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
      centers.push(this.pickRandomCenter(this.gridDimensions.centerPad, this.gridDimensions.centerPad, this.gridDimensions.width - this.gridDimensions.centerPad, this.gridDimensions.height - this.gridDimensions.centerPad));
    }
    colour = null;
    distSq = 0;
    for (y = k = 0, ref1 = this.gridDimensions.height; 0 <= ref1 ? k < ref1 : k > ref1; y = 0 <= ref1 ? ++k : --k) {
      for (x = l = 0, ref2 = this.gridDimensions.width; 0 <= ref2 ? l < ref2 : l > ref2; x = 0 <= ref2 ? ++l : --l) {
        if (this.pointIsACenterPoint(x, y, centers)) {
          colour = this.landscapeColours['5'];
        }
        if ((x < 1 || x > this.gridDimensions.width - 2) || (y < 1 || y > this.gridDimensions.height - 2)) {
          colour = this.landscapeColours['0'];
        } else {
          distSq = this.getMinimumDistanceFromACenter(x, y, centers);
          if (distSq > 1) {
            distSq = 1;
          }
          if (distSq < 0) {
            distSq = 0;
          }
          distSq = Math.abs(Math.log(distSq) / 7);
          for (i = m = 0; m < 3; i = ++m) {
            wobble = Math.random() * 0.05;
            distSq -= wobble;
          }
          val = distSq;
          if (val <= this.heightBreaks[0]) {
            col = this.landscapeColours['0'];
          } else if (val > this.heightBreaks[0] && val <= this.heightBreaks[1]) {
            col = this.landscapeColours['1'];
          } else if (val > this.heightBreaks[1] && val <= this.heightBreaks[2]) {
            col = this.landscapeColours['2'];
          } else if (val > this.heightBreaks[2] && val <= this.heightBreaks[3]) {
            col = this.landscapeColours['3'];
          } else if (val > this.heightBreaks[3]) {
            col = this.landscapeColours['4'];
          }
          colour = col;
        }
        this.grid[y][x].colour = colour;
      }
    }
    return null;
  };

  App.prototype.updateGridSprites = function() {
    var j, k, ref, ref1, sp, sprite, x, y;
    for (sprite in this.gridSprites) {
      this.gridSprites[sprite].clear();
    }
    for (y = j = 0, ref = this.gridDimensions.height; 0 <= ref ? j < ref : j > ref; y = 0 <= ref ? ++j : --j) {
      for (x = k = 0, ref1 = this.gridDimensions.width; 0 <= ref1 ? k < ref1 : k > ref1; x = 0 <= ref1 ? ++k : --k) {
        sp = this.gridSprites[x + '_' + y];
        sp.beginFill(this.grid[y][x].colour, 1);
        sp.drawRect(0, 0, this.defaultTileSize, this.defaultTileSize);
        sp.endFill();
      }
    }
    return null;
  };

  App.prototype.handleGifCreated = function(url) {
    return console.log(url);
  };

  App.prototype.update = function() {
    this.renderer.render(this.stage);
    return null;
  };

  return App;

})();

module.exports = App;


},{"./utils/ColourConversion":3}],2:[function(require,module,exports){
var App;

App = require('./app');

window.app = new App();

window.app.init();


},{"./app":1}],3:[function(require,module,exports){

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


},{}]},{},[2])