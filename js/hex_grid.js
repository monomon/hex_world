/**
 * Represends a tile on the map
 * 
 */
var Tile = {
	/**
	 * Initialize with the passed config object
	 * @param {Object} config
	 */
	init : function(config)
	{
		this.value = config.value;
		this.gridPos = config.gridPos;
		this.el = config.el;

		return this;
	},

};

/**
 * HexGrid represents the grid
 * has width and height (in number of tiles), tile radius,
 * also represents terrain, so a tile has a 'value'.
 *
 * The tiles are kept in a one-dimensional array.
 * Rows are wrapped by {@link HexGrid.width} when drawing and when two-dimensional coordinates
 * are needed.
 *
 */
var HexGrid = {
	propsToCopy : ['width', 'height', 'tileRadius', 'wrapX'],
	tileStroke : '#ffffff',

	/**
	 * Initialize the grid based on the passed configuration
	 * This creates the SVG context, calculates some properties,
	 * and adds up all tiles.
	 * @param {Object} config
	 */
	init : function(config)
	{
		// copy over properties... maybe try with ES6 classes
		for (var i = this.propsToCopy.length - 1; i >= 0; i--) {
			var propName = this.propsToCopy[i];
			if (config[propName]) {
				this[propName] = config[propName];
			}
		}

		console.assert(this.width);
		console.assert(this.height);
		console.assert(this.tileRadius);

		this.hexBounds = hexBounds(this.tileRadius);

		this.ctx = SVG(config.elId);

		this.tilesGroup = this.ctx.group();
		this.tilesGroup.addClass('tilesGroup');

		// cache this so we don't have to compute it

		this.ctx.size(
			this.hexBounds.width*this.width + this.hexBounds.width,
			this.hexBounds.height*this.height
		);

		// add a mapping for easier access
		this.elToTile = new WeakMap();

		this.tiles = [];

		for (var i=0; i<this.width*this.height; i++) {
			this.createTile(i);
		}

		return this;
	},

	/**
	 * Add a tile for the given index
	 * @param {Number} i index of the tile. This is used for calculations,
	 * tile will actually be pushed at the end of the array. FIXME
	 * @return {Number} the new number of tiles
	 */
	createTile : function(i)
	{
		var tile = this.createRandomTile(i);

		var numTiles = this.tiles.push(tile);

		this.elToTile.set(tile.el, tile);

		return numTiles;
	},

	/**
	 * Create tile svg element
	 * and apply default styling
	 * @param {Tile} tile
	 * @return {Element} the hex SVG element
	 */
	drawTile : function(tile)
	{
		// TODO: get perlin noise here
		// for now just monochrome
		var color = new SVG.Color({
			r : tile.value, g : tile.value, b : tile.value
		});

		var position = this.gridToCoords(tile.gridPos);

		return drawHex(
			this.tilesGroup,
			position,
			this.tileRadius
		)
		.addClass('hex')
		.style({
			fill : color.toHex(),
			stroke : this.tileStroke
		});
	},

	/**
	 * Convert grid to screen coordinates
	 * @param {Array} gridPos An array containing the two grid coordinates
	 * @return {Array} array containing screen coordinates
	 */
	gridToCoords : function(gridPos)
	{
		// odd rows are indented by half a width
		// ideally we'd use radial positions here but for now, hack...
		var bias = ((gridPos[1] % 2) !== 0) ? 0.5 : 0;
		return [
			(gridPos[0] % this.width + bias + 0.5) * this.hexBounds.width + 1,
			(gridPos[1] * (this.hexBounds.height*0.75)) + 0.5 * this.hexBounds.height + 1
		];
	},

	/**
	 * Obtain a random tile from the array.
	 * @return {Tile}
	 */
	getRandomTile : function()
	{
		return this.tiles[Math.floor(Math.random()*(this.tiles.length))];
	},

	/**
	 * there's a circular dependency here that needs fixing
	 * @param {Number} i index used for some calculations
	 * @return {Tile}
	 */
	createRandomTile : function(i)
	{
		var rand = Math.random();
		var tile = Object.create(Tile).init({
			value : Math.floor(rand*200 + ((rand > 0.5) ? 55 : Math.random()*25)),
			gridPos : [
				i % this.width,
				Math.floor(i / this.width)
			]
		});

		tile.el = this.drawTile(tile);

		return tile;
	},

	/**
	 * return all tiles around the passed tile
	 * works with wraparound, apparently
	 *
	 * @param {Tile} centerTile tile whose neighbors to find
	 * @return {Tile[]} array of the surounding tiles
	 */
	getNeighbors : function(centerTile)
	{
		var neighbors = [];
		var cubeCoords = offsetToCube(centerTile.gridPos);

		for (var i = 0; i < 3; i++) {
			for (var j = 1; j < 3; j++) {
				var newCoords = cubeCoords.slice(0);
				// x-y-z have to add up to 0, so remove one from the next
				newCoords[i] += 1;
				newCoords[Number((i+j)%newCoords.length)] -= 1;
				// console.log(JSON.stringify(cubeCoords), 'cube coords');
				// console.log(JSON.stringify(newCoords), 'new coords');
				var offsetCoords = cubeToOffset(newCoords);

				if (this.wrapX) {
					// wrap x around
					if (offsetCoords[0] < 0) {
						offsetCoords[0] += this.width;
					} else if (offsetCoords[0] >= this.width) {
						offsetCoords[0] -= this.width;
					}
				} else {
					if (offsetCoords[0] < 0 || offsetCoords[0] >= this.width) {
						continue;
					}
				}

				var tile = this.tiles[offsetCoords[1]*this.width + offsetCoords[0]];
				if (tile && neighbors.indexOf(tile) < 0) {
					neighbors.push(tile);
				}
			}
		}

		return neighbors;
	}
};
