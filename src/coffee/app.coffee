ColourConversion = require './utils/ColourConversion'

class App



	init: ->
		console.log 'App Started!'

#		@capturer = new CCapture( { format: 'gif', workersPath: 'js/vendors/' } )

		@defaultTileSize = 64
		@spritePool = []

		@colours =
			white: 0xf2f2f2
			red: 0xd95964
			blue: 0x274073
			lightBrown: 0xa6926d
			darkBrown: 0x8c5a4f

		@landscapeColours =
			0: 0x3782C9
			1: 0x65C0E5
			2: 0xFFF29C
			3: 0x3FDE4E
			4: 0x24C21D

#		@landscapeColours =
#			0: 0x22d9d0
#			1: 0x70edde
#			2: 0xf5ff86
#			3: 0x452c32
#			4: 0x524544


		@renderer = PIXI.autoDetectRenderer window.innerWidth, window.innerHeight
#		@renderer.backgroundColor = @colours.white
		@renderer.backgroundColor = @landscapeColours['0']

		@stage = new PIXI.Container()

		document.body.appendChild @renderer.view

		@gridDimensions =
			width: 64
			height: 64
			spacing: 12
			centers: 5
			centerPad: 16
			randomExtraCenters: true
			numberOfRandomExtraCenters: 8
			fadeValues: true
			addNoise: true
			gaussian: false
			gaussianPasses: 3

		@heightBreaks = [
			0.15,
			0.29,
			0.48,
			0.67
		]

#		@gridDimensions =
#			width: 30
#			height: 30
#			spacing: 24

		@grid = []
		@gridSprites = []

		@gridContainer = new PIXI.Container()
		@stage.addChild @gridContainer

#		@createGrid()

		@generateGridColours()

#		window.onclick = @generateGridColours

		@gui = new dat.GUI()

		@gridProps = @gui.addFolder('Grid')
		@heights = @gui.addFolder('Height Breaks')

		@gridProps.add(@gridDimensions, 'width', 8, 64).step(1).onChange(=>
		  @gridDimensions.height = @gridDimensions.width
		)
		@gridProps.add(@gridDimensions, 'spacing', 2, 32).step(2)
		@gridProps.add(@gridDimensions, 'centers', 1, 99).step(1)
		@gridProps.add(@gridDimensions, 'centerPad', 0, 64).step(1)
		@gridProps.add(@gridDimensions, 'randomExtraCenters')
		@gridProps.add(@gridDimensions, 'numberOfRandomExtraCenters', 1, 16).step(1).name('# extra centers')
		@gridProps.add(@gridDimensions, 'fadeValues')
		@gridProps.add(@gridDimensions, 'addNoise')
		@gridProps.add(@gridDimensions, 'gaussian')
		@gridProps.add(@gridDimensions, 'gaussianPasses', 1, 10).step(1)

		@heights.add(@heightBreaks, '0', 0, 1)
		@heights.add(@heightBreaks, '1', 0, 1)
		@heights.add(@heightBreaks, '2', 0, 1)
		@heights.add(@heightBreaks, '3', 0, 1)


		@gui.add(@, 'generateGridColours').name("Generate")

#		@capturer.start()
#		@captureCount = 0

		#rAF
		@update()


	generateGridColours: =>

		@createGrid()

		@fillGrid()

		if @gridDimensions.gaussian
			for i in [0...@gridDimensions.gaussianPasses]
				@smoothValues()

		if @gridDimensions.fadeValues then @fadeHeights()

		if @gridDimensions.addNoise then @addNoise()

		@updateGridSprites()

		@update()

		null

	addNoise: ->

		ran = 0
		src = 0
		res = 0
		for y in [0...@gridDimensions.height]
			for x in [0...@gridDimensions.width]
				src = ColourConversion.hexToRgb @grid[x][y].colour
				ran = Math.round((Math.random() * 255) / 20)
				res = [[src[0]+ran], [src[1]+ran], [src[2]+ran]]
				if res[0] > 255 then res[0] = 255
				if res[1] > 255 then res[1] = 255
				if res[2] > 255 then res[2] = 255
				@grid[x][y].colour = ColourConversion.rgbToHex res

		null


	#generate a grid of objects in a 2d array, designated by @gridDimensions object
	createGrid: ->

		@purgeGrid()

		for y in [0...@gridDimensions.height]
			@grid.push []
			for x in [0...@gridDimensions.width]
				@grid[y].push {id:x+'_'+y, x:x, y:y, colour:null}
				@gridSprites[x+'_'+y] = @createGridSprite x, y

		@gridContainer.position.x = (window.innerWidth - @gridContainer.width) * 0.5
		@gridContainer.position.y = (window.innerHeight - @gridContainer.height) * 0.5

		null

	purgeGrid: ->
		for location, sprite of @gridSprites
			@gridContainer.removeChild sprite
			@spritePool.push sprite
		@gridSprites = {}
		null

	createGridSprite: ( xpos, ypos ) ->
		if @spritePool.length > 0
			sp = @spritePool.splice(0, 1)[0]
		else
			sp = new PIXI.Graphics()
			sp.lineStyle 1, @colours.lightBrown
			sp.beginFill 0, 0.1
			sp.drawRect 0, 0, @defaultTileSize, @defaultTileSize
			sp.endFill()
		sp.id = xpos+'_'+ypos
		sp.position.x = xpos * @gridDimensions.spacing
		sp.position.y = ypos * @gridDimensions.spacing
		scale = @gridDimensions.spacing / @defaultTileSize
		sp.scale.x = sp.scale.y = scale
		@gridContainer.addChild sp
		return sp

	pickRandomCenter: (minX, minY, maxX, maxY) ->
		ranX = minX + (Math.floor(Math.random() * (maxX - minX)))
		ranY = minY + (Math.floor(Math.random() * (maxY - minY)))

		#old
#		hw = Math.round(@gridDimensions.width * 0.5)
#		hh = Math.round(@gridDimensions.height * 0.5)
#		ranX = (hw - (hw*0.25)) + (Math.floor(Math.random() * (hw*0.5)))
#		ranY = (hh - (hh*0.25)) + (Math.floor(Math.random() * (hh*0.5)))
		#older
#		ranX = 13 + Math.floor(Math.random()*7)
#		ranY = 13 + Math.floor(Math.random()*7)
		return {x:ranX, y:ranY}

	getNeighbourAverage: (x, y) ->
		gridArr = []
		gridArr.push ColourConversion.hexToRgb @grid[x-1][y-1].colour
		gridArr.push ColourConversion.hexToRgb @grid[x-1][y].colour
		gridArr.push ColourConversion.hexToRgb @grid[x-1][y+1].colour
		gridArr.push ColourConversion.hexToRgb @grid[x][y-1].colour
		gridArr.push ColourConversion.hexToRgb @grid[x][y+1].colour
		gridArr.push ColourConversion.hexToRgb @grid[x+1][y-1].colour
		gridArr.push ColourConversion.hexToRgb @grid[x+1][y].colour
		gridArr.push ColourConversion.hexToRgb @grid[x+1][y+1].colour

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

	adjustHeightValue: (x, y) ->

		sourceColour = @grid[x][y].colour
		higherColour = @grid[x][y].colour

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
		gridArr.push @grid[x-1][y-1].colour
		gridArr.push @grid[x-1][y].colour
		gridArr.push @grid[x-1][y+1].colour
		gridArr.push @grid[x][y-1].colour
		gridArr.push @grid[x][y+1].colour
		gridArr.push @grid[x+1][y-1].colour
		gridArr.push @grid[x+1][y].colour
		gridArr.push @grid[x+1][y+1].colour

		if gridArr.indexOf(higherColour) is -1
			return sourceColour



		middleColour = []
		sourceRGB = ColourConversion.hexToRgb sourceColour
		targetRGB = ColourConversion.hexToRgb higherColour
		middleColour[0] = sourceRGB[0] + ((targetRGB[0] - sourceRGB[0]) * 0.5)
		middleColour[1] = sourceRGB[1] + ((targetRGB[1] - sourceRGB[1]) * 0.5)
		middleColour[2] = sourceRGB[2] + ((targetRGB[2] - sourceRGB[2]) * 0.5)

		return ColourConversion.rgbToHex middleColour


	fadeHeights: ->

		curPoint = null
		smoothedColours = {}

		for y in [1...@gridDimensions.height-1]
			for x in [1...@gridDimensions.width-1]
				curPoint = @grid[x][y]
				smoothedColours[x+'_'+y] = @adjustHeightValue x, y

		for y in [1...@gridDimensions.height-1]
			for x in [1...@gridDimensions.width-1]
				@grid[x][y].colour = smoothedColours[x+'_'+y]

		null

	smoothValues: ->

		curPoint = null
		avgColours = {}
		for y in [1...@gridDimensions.height-1]
			for x in [1...@gridDimensions.width-1]
				curPoint = @grid[x][y]
				avg = @getNeighbourAverage x, y
				avgColours[x+'_'+y] = avg

		for y in [1...@gridDimensions.height-1]
			for x in [1...@gridDimensions.width-1]
				@grid[x][y].colour = avgColours[x+'_'+y]
		null

	pointIsACenterPoint: (x, y, points) ->
		val = false
		for point in points
			if point.x is x and point.y is y
				val = true
		return val

	calculateSquareDistanceFromMapCenter: ( x, y, center ) ->
		xDist = center.x - x
		yDist = center.y - y
		distSq = (xDist*xDist) + (yDist*yDist)
		halfWidthSq = (@gridDimensions.width*0.5) * (@gridDimensions.width*0.5)
		return distSq / halfWidthSq

	getMinimumDistanceFromACenter: (x, y, points) ->
#		dist = 10000
		dist = 0
		for point in points
#			dist = Math.min dist, @calculateSquareDistanceFromMapCenter x, y, point
			dist += @calculateSquareDistanceFromMapCenter x, y, point
		dist /= points.length
		return dist

	fillGrid: ->

		numCenters = @gridDimensions.centers #5 + (Math.round(Math.random()*8))
		if @gridDimensions.randomExtraCenters then numCenters += (Math.round(Math.random()*@gridDimensions.numberOfRandomExtraCenters))
		centers = []
		for i in [0...numCenters]
			centers.push @pickRandomCenter @gridDimensions.centerPad, @gridDimensions.centerPad, @gridDimensions.width-@gridDimensions.centerPad, @gridDimensions.height-@gridDimensions.centerPad


		colour = null
		distSq = 0

		for y in [0...@gridDimensions.height]
			for x in [0...@gridDimensions.width]
				#center point is the highest point
				if @pointIsACenterPoint x, y, centers
					colour = @landscapeColours['5']
				#edge is always lowest possible value
				if ( x < 1 or x > @gridDimensions.width-2 ) or ( y < 1 or y > @gridDimensions.height-2 )
					colour = @landscapeColours['0']
				#get the ratio between 0 and 5 for land colour
				else
					#straight distance = smooth circle
					distSq = @getMinimumDistanceFromACenter x, y, centers
					if distSq > 1 then distSq = 1
					if distSq < 0 then distSq = 0

#					distSq = Math.pow distSq, 0.04
					distSq = Math.abs(Math.log(distSq) / 7)

					for i in [0...3]
						wobble = Math.random() * 0.05
						distSq -= wobble
#						distSq *= distSq

#					distSq = Math.pow distSq, 1


#					if distSq >= 0.75
#						distSq = Math.pow distSq, 0.5

#					sq = 0.001/distSq
#					distSq = Math.pow distSq, sq
#					distSq = Math.pow distSq, sq
#					wobble = Math.random() * 0.05
#					distSq += wobble

					val = distSq

					if val <= @heightBreaks[0]
						col = @landscapeColours['0']
					else if val > @heightBreaks[0] and val <= @heightBreaks[1]
						col = @landscapeColours['1']
					else if val > @heightBreaks[1] and val <= @heightBreaks[2]
						col = @landscapeColours['2']
					else if val > @heightBreaks[2] and val <= @heightBreaks[3]
						col = @landscapeColours['3']
					else if val > @heightBreaks[3]
						col = @landscapeColours['4']

#					col = Math.floor(255*val)
#					if col < 0 then col = 0
#					if col > 255 then col = 255
#					col = ColourConversion.rgbToHex [col, col, col]

#					using fade
#					col = Math.floor(255 * (1-distSq))
#					col = ColourConversion.rgbToHex [Math.round(col), Math.round(col), Math.round(col)]

#					using keys
					#nice balance
#					sq = 0.5
#					distSq = Math.pow distSq, sq
#					distSq = Math.pow distSq, sq
#					wobble = Math.random() * 0.1
#					distSq += wobble
#					col = 6 - (distSq * 5)
#
#					if col >= 0.99 and col < 1
#						col = 1
#					else if col > 1.79 and col <= 2.99
#						col = 2



#					col = Math.floor(col)

					#skinny top, not much distortion
#					asin = (Math.asin(distSq) * Math.asin(Math.pow(distSq, 1))) + 2.997
#					wobble = Math.random() * 0.001
#					asin += wobble
#					col = 5 - Math.floor(asin)


					# bit crazy
#					wobble = -0.15 + (Math.random() * 0.3)
#					distSq += (wobble * distSq)
#					col = 5 - Math.floor(distSq*5)


#					if col < 0 then col = 0
#					else if col > 4 then col = 4
#					colour = @landscapeColours[Math.floor(col).toString()]
					colour = col

				@grid[y][x].colour = colour

		null





	updateGridSprites: ->
		for sprite of @gridSprites
			@gridSprites[sprite].clear()

		for y in [0...@gridDimensions.height]
			for x in [0...@gridDimensions.width]
				sp = @gridSprites[x+'_'+y]
#				sp.clear()
#				sp.lineStyle 1, @colours.darkBrown
				sp.beginFill @grid[y][x].colour, 1
				sp.drawRect 0, 0, @defaultTileSize, @defaultTileSize
				sp.endFill()
		null

	handleGifCreated: ( url ) ->
		console.log url

	#rAF
	update: =>

		@renderer.render @stage

#		if @captureCount <= 120
#			@capturer.capture @renderer.view
#			@captureCount++
#		else
#			@capturer.stop()
#			@capturer.save @handleGifCreated


#		requestAnimationFrame @update
		null

module.exports = App