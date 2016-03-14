class GridSprites extends PIXI.Container

	constructor: ->
		super()

		@pool = []
		@sprites = {}

		@defaultTileSize = 64
		@tileSize = 12

		@border = false

		@debugClick = (e) =>
			console.log 'no debug'


	createGrid: ( gridData ) ->

		@clearCurrentGrid()

		w = gridData.width
		h = gridData.height

		@sprites = {}

		for y in [0...h]
			for x in [0...w]
				sp = @sprites[x+'_'+y] = @getTileSprite x, y, gridData.data[y][x].colour
				@addChild sp

		@position.x = (window.innerWidth - @width) * 0.5
		@position.y = (window.innerHeight - @height) * 0.5

		null


	clearCurrentGrid: ->
		while @children.length > 0
			sp = @getChildAt 0
			@removeChild sp
			@pool.push sp
		null


	getTileSprite: ( xpos, ypos, colour ) ->
		if @pool.length > 0
			sp = @pool.splice(0, 1)[0]
		else
			sp = new PIXI.Graphics()
			sp.interactive = true
			sp.on 'mouseup', @debugClick

		sp.clear()
		if @border
			sp.lineStyle 3, 0xFFFFFF, 0.3
		sp.beginFill colour
		sp.drawRect 0, 0, @defaultTileSize, @defaultTileSize
		sp.endFill()



		sp.id = xpos+'_'+ypos
		sp.position.x = xpos * @tileSize
		sp.position.y = ypos * @tileSize
		scale = @tileSize / @defaultTileSize
		sp.scale.x = sp.scale.y = scale

		return sp

module.exports = GridSprites