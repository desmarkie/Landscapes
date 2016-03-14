
GridSprites = require './GridSprites'
GridMapGen = require './GridMapGen'
GridMapColour = require './GridMapColour'

class App



	init: ->
		console.log 'App Started!'

		@colours =
			white: 0xf2f2f2
			red: 0xd95964
			blue: 0x274073
			lightBrown: 0xa6926d
			darkBrown: 0x8c5a4f

		@lotsCount = 3

		@grid = new GridMapGen()
		@mapColour = new GridMapColour()

		@renderer = PIXI.autoDetectRenderer window.innerWidth, window.innerHeight
		@renderer.backgroundColor = @mapColour.landscapeColours['0']

		@stage = new PIXI.Container()

		document.body.appendChild @renderer.view

		@gridSprites = new GridSprites()
		@stage.addChild @gridSprites

		@gridSprites.debugClick = ( e ) =>
			x = Math.floor(e.target.position.x / @gridSprites.tileSize)
			y = Math.floor(e.target.position.y / @gridSprites.tileSize)
			comH = @grid.calculateCombinedHeight(x, y, @grid.centers)
			maxH = @grid.max
			norH = comH / maxH
			console.log x, y
			console.log 'combined height', comH
			console.log 'normalisedHeight', norH
			console.log 'max height', maxH


		@generateGrid()

		@gui = new dat.GUI()

		@gridProps = @gui.addFolder('Map')
		@gui.add(@, 'generateGrid').name("Generate")
		@heights = @gui.addFolder('Height Breaks')
		@colours = @gui.addFolder('Colours')
		@extras = @gui.addFolder('Extras')

		@gridProps.add(@grid, 'width', 8, 128).step(1).name('Grid Size').onChange(=>
		  @grid.height = @grid.width
		)
		@gridProps.add(@gridSprites, 'tileSize', 2, 32).step(2).name('Tile Size')
		@gridProps.add(@grid, 'centerPad', 0, 64).step(1)
		@gridProps.add(@grid, 'numberOfCenters', 1, 99).step(1)
		@gridProps.add(@grid, 'randomExtraCenters')
		@gridProps.add(@grid, 'numberOfRandomExtraCenters', 1, 16).step(1).name('# extra centers')
		@gridProps.add(@grid, 'normalise').name('normalise values')
		@gridProps.add(@grid, 'wobble').name('distance noise')
		@gridProps.add(@grid, 'wobbleAmount', 0.05, 0.5).step(0.01).name('Wobble Amount')
		@gridProps.add(@grid, 'wobbleCount', 1, 20).step(1).name('Wobble Count')


		@extras.add(@mapColour, 'blend').onChange( @generateGridColours )
		@extras.add(@mapColour, 'gaussian').onChange( @generateGridColours )
		@extras.add(@mapColour, 'gaussianPasses', 1, 10).step(1).onChange( @generateGridColours )
		@extras.add(@mapColour, 'addNoise').onChange( @generateGridColours )
		@extras.add(@gridSprites, 'border').onChange( @generateGridColours )
		@extras.add(@mapColour, 'fade').onChange( @generateGridColours )
		@moreStuff = @extras.addFolder('more')
		@moreStuff.add(@, 'lotsCount', 2, 50)
		@moreStuff.add(@, 'drawLots')


		@colours.addColor(@mapColour.landscapeColours, '0').onChange(=>
		  @renderer.backgroundColor = @mapColour.landscapeColours['0']
		  @generateGridColours()
		)
		@colours.addColor(@mapColour.landscapeColours, '1').onChange( @generateGridColours )
		@colours.addColor(@mapColour.landscapeColours, '2').onChange( @generateGridColours )
		@colours.addColor(@mapColour.landscapeColours, '3').onChange( @generateGridColours )
		@colours.addColor(@mapColour.landscapeColours, '4').onChange( @generateGridColours )

		@heights.add(@mapColour.heightBreaks, '0', 0, 1).onChange( @generateGridColours )
		@heights.add(@mapColour.heightBreaks, '1', 0, 1).onChange( @generateGridColours )
		@heights.add(@mapColour.heightBreaks, '2', 0, 1).onChange( @generateGridColours )
		@heights.add(@mapColour.heightBreaks, '3', 0, 1).onChange( @generateGridColours )

	generateGrid: =>
		@grid.generateMap()
		@generateGridColours()
		null

	drawLots: ->

		@gridSprites.alpha = 0

		@lots = new PIXI.Container()
		@stage.addChild @lots
		count = @lotsCount * @lotsCount
		x = 0
		y = 0
		amt = 64*12
		scale = 0.2

		totalHeight = (amt * @lotsCount) * scale
		lscale = window.innerHeight / totalHeight
		if lscale > 1 then lscale = 1
		@lots.scale.x = @lots.scale.y = lscale

		@lots.position.x = (window.innerWidth-(totalHeight*lscale))*0.5
		@lots.position.y = (window.innerHeight-(totalHeight*lscale))*0.5

		for i in [0...count]
			console.log 'generating....', i
			@generateGrid()
			tex = new PIXI.RenderTexture @renderer, amt, amt
			tex.render @gridSprites
			sp = new PIXI.Sprite tex
			sp.scale.x = sp.scale.y = scale
			sp.x = (amt*scale)*x
			sp.y = (amt*scale)*y
			x++
			if x is @lotsCount
				console.log 'bump'
				x = 0
				y++
			@lots.addChild sp

			@renderer.render @stage

#			@update()

		null

	generateGridColours: =>

		@mapColour.applyColourToGrid @grid

		@gridSprites.createGrid {width:@grid.width, height:@grid.height, data:@grid.grid}

		@update()

		null


	update: =>

		@renderer.render @stage

		null

module.exports = App