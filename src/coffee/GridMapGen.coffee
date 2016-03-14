Peak = require './Peak'
class GridMapGen

	constructor: ->
		@grid = []

		@width = 64
		@height = 64

		@centers = []
		@numberOfCenters = 26
		@randomExtraCenters = true
		@numberOfRandomExtraCenters = 16
		@centerPad = 10

		@normalise = true

		@wobble = true
		@wobbleAmount = 0.3
		@wobbleCount = 6

	getMax: ->
		min = 1
		max = 0
		for y in [0...@height]
			for x in [0...@width]
				if @grid[y][x].value < min then min = @grid[y][x].value
				if @grid[y][x].value > max then max = @grid[y][x].value
#		console.log min, max
		return max

	squareDistanceBetweenTwoPoints: ( ptA, ptB ) ->
		xDist = ptB.position.x - ptA.position.x
		yDist = ptB.position.y - ptA.position.y
		distSq = (xDist*xDist) + (yDist*yDist)
		return distSq

	getMinimumDistanceFromCenters: ( x, y, points ) ->
		distSq = 10000
		for point in points
			distSq = Math.min distSq, @squareDistanceBetweenTwoPoints {position:{x:x, y:y}}, point
		halfWidthSq = (@width*0.5) * (@width*0.5)
		distSq /= halfWidthSq
		return distSq

	getAverageDistanceFromACenter: (x, y, points) ->
		distSq = 0
		for point in points
			distSq += @squareDistanceBetweenTwoPoints {position:{x:x, y:y}}, point
		distSq /= points.length
		halfWidthSq = (@width*0.5) * (@width*0.5)
		distSq /= halfWidthSq
		return distSq

	pickRandomCenter: (minX, minY, maxX, maxY) ->
		ranX = minX + (Math.floor(Math.random() * (maxX - minX)))
		ranY = minY + (Math.floor(Math.random() * (maxY - minY)))
		peak = new Peak()
		peak.position.x = ranX
		peak.position.y = ranY
		peak.falloff = 3 + (17*Math.random())
		peak.height = 0.5 + Math.random()
		return peak

	getHeightFromPeak: (x, y, peak) ->
		val = 0

		xDif = peak.position.x - x
		yDif = peak.position.y - y
		dist = Math.sqrt((xDif*xDif)+(yDif*yDif))

		if dist < peak.falloff
			val = peak.height * (1-(dist/peak.falloff))

		return val

	calculateCombinedHeight: (x, y, points) ->
		val = 0

		for point in points
			val += @getHeightFromPeak x, y, point

		if val < 0 then console.log x, y

		return val

	pointIsACenterPoint: (x, y, points) ->
		val = false
		for point in points
			if point.position.x is x and point.position.y is y
				val = true
		return val

	getWobble: ->
		amt = 0
		for i in [0...@wobbleCount]
			amt += Math.random() * @wobbleAmount
		return amt

	normaliseValues: ( min, max ) ->
		@max = max
		for y in [0...@height]
			for x in [0...@width]
#				if @pointIsACenterPoint x, y, @centers then @grid[y][x].value = max
				@grid[y][x].value /= max

		null

	generateMap: ->

		numCenters = @numberOfCenters
		if @randomExtraCenters then numCenters += (Math.round(Math.random()*@numberOfRandomExtraCenters))
		@centers = []
		for i in [0...numCenters]
			@centers.push @pickRandomCenter @centerPad, @centerPad, @width-@centerPad, @height-@centerPad

		@grid = []
		value = 0
		minValue = 1
		maxValue = 0
		for y in [0...@height]
			@grid[y] = []
			for x in [0...@width]
				if ( x < 1 or x > @width-2 ) or ( y < 1 or y > @height-2 )
					value = 0
				else
					value = @calculateCombinedHeight x, y, @centers

				if @wobble then value -= @getWobble()

				if value < minValue then minValue = value
				if value > maxValue then maxValue = value
				@grid[y][x] = {id:x+'_'+y, x:x, y:y, value:value}

		if @normalise then @normaliseValues minValue, maxValue

		# old method - calculate distance from a peak and falloff - hard to tweak
		###
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

		###

		null

module.exports = GridMapGen