ColourConversion = require './utils/ColourConversion'

class GridMapColour

	constructor: ->
		@landscapeColours = [
			0x3782C9,
			0x65C0E5,
			0xFFF29C,
			0x3FDE4E,
			0x24C21D
			]

		@heightBreaks = [
			0.05,
			0.2,
			0.5,
			0.8
		]

		@blend = true
		@blendDistance = 1

		@addNoise = true

		@gaussian = false
		@gaussianPasses = 1

		@fade = false




	applyColourToGrid: ( grid ) ->
		h = grid.width
		w = grid.height
		for y in [0...h]
			for x in [0...w]
				if @fade
					col = Math.round(255*grid.grid[y][x].value)
					grid.grid[y][x].colour = ColourConversion.rgbToHex([col, col, col]) #@calculateTileColour grid.grid[y][x].value
				else
					grid.grid[y][x].colour = @calculateTileColour grid.grid[y][x].value

		if @blend then @fadeHeights grid
		if @gaussian
			for i in [0...@gaussianPasses]
				@smoothValues grid
		if @addNoise then @addNoiseToColours grid
		null

	calculateTileColour: ( tileValue ) ->
		for i in [0...@heightBreaks.length]
			if tileValue <= @heightBreaks[i]
				return @landscapeColours[i]

		return @landscapeColours[@landscapeColours.length-1]


	addNoiseToColours: ( grid ) ->

		h = grid.width
		w = grid.height

		ran = 0
		src = 0
		res = 0
		for y in [0...h]
			for x in [0...w]
				src = ColourConversion.hexToRgb grid.grid[y][x].colour
				ran = Math.round((Math.random() * 255) / 20)
				res = [[src[0]+ran], [src[1]+ran], [src[2]+ran]]
				if res[0] > 255 then res[0] = 255
				if res[1] > 255 then res[1] = 255
				if res[2] > 255 then res[2] = 255
				grid.grid[y][x].colour = ColourConversion.rgbToHex res

		null

	getNeighbourAverage: (x, y, grid) ->
		gridArr = []
		gridArr.push ColourConversion.hexToRgb grid.grid[x-1][y-1].colour
		gridArr.push ColourConversion.hexToRgb grid.grid[x-1][y].colour
		gridArr.push ColourConversion.hexToRgb grid.grid[x-1][y+1].colour
		gridArr.push ColourConversion.hexToRgb grid.grid[x][y-1].colour
		gridArr.push ColourConversion.hexToRgb grid.grid[x][y+1].colour
		gridArr.push ColourConversion.hexToRgb grid.grid[x+1][y-1].colour
		gridArr.push ColourConversion.hexToRgb grid.grid[x+1][y].colour
		gridArr.push ColourConversion.hexToRgb grid.grid[x+1][y+1].colour

		r = 0
		g = 0
		b = 0

		for grid in gridArr
			r += grid[0]
			g += grid[1]
			b += grid[2]

		r /= 8
		g /= 8
		b /= 8

		newColour = ColourConversion.rgbToHex [r, g, b]
		return newColour

	adjustHeightValue: (x, y, grid) ->

		sourceColour = grid.grid[x][y].colour
		higherColour = grid.grid[x][y].colour

		if sourceColour is @landscapeColours['4']
			return @landscapeColours['4']
		else if sourceColour is @landscapeColours['3']
			higherColour = @landscapeColours['4']
		else if sourceColour is @landscapeColours['2']
			higherColour = @landscapeColours['3']
		else if sourceColour is @landscapeColours['1']
			higherColour = @landscapeColours['2']
		else if sourceColour is @landscapeColours['0']
			higherColour = @landscapeColours['1']

		gridArr = []
		gridArr.push grid.grid[x-1][y-1].colour
		gridArr.push grid.grid[x-1][y].colour
		gridArr.push grid.grid[x-1][y+1].colour
		gridArr.push grid.grid[x][y-1].colour
		gridArr.push grid.grid[x][y+1].colour
		gridArr.push grid.grid[x+1][y-1].colour
		gridArr.push grid.grid[x+1][y].colour
		gridArr.push grid.grid[x+1][y+1].colour

		if gridArr.indexOf(higherColour) is -1
			return sourceColour



		middleColour = []
		sourceRGB = ColourConversion.hexToRgb sourceColour
		targetRGB = ColourConversion.hexToRgb higherColour
		middleColour[0] = sourceRGB[0] + ((targetRGB[0] - sourceRGB[0]) * 0.5)
		middleColour[1] = sourceRGB[1] + ((targetRGB[1] - sourceRGB[1]) * 0.5)
		middleColour[2] = sourceRGB[2] + ((targetRGB[2] - sourceRGB[2]) * 0.5)

		return ColourConversion.rgbToHex middleColour


	fadeHeights: ( grid ) ->

		curPoint = null
		smoothedColours = {}

		for y in [1...grid.height-1]
			for x in [1...grid.width-1]
				curPoint = grid.grid[x][y]
				smoothedColours[x+'_'+y] = @adjustHeightValue x, y, grid

		for y in [1...grid.height-1]
			for x in [1...grid.width-1]
				grid.grid[x][y].colour = smoothedColours[x+'_'+y]

		null

	smoothValues: ( grid ) ->

		curPoint = null
		avgColours = {}
		for y in [1...grid.height-1]
			for x in [1...grid.width-1]
				curPoint = grid.grid[x][y]
				avg = @getNeighbourAverage x, y, grid
				avgColours[x+'_'+y] = avg

		for y in [1...grid.height-1]
			for x in [1...grid.width-1]
				grid.grid[x][y].colour = avgColours[x+'_'+y]
		null


module.exports = GridMapColour