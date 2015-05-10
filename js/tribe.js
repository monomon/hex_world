/**
 * @lends Tribe#
 */
var Tribe = {
	maxGrowth : 1.1,
	maxStarve : -0.9,
	growthRate : 1.2,
	growthAsymptote : 0.50,
	decisionPeriod : 1500,
	colonyPopulationFraction : 0.4,
	maxPatience : 700,
	showTextFlag : false,

	/**
	 * A tribe is an automated agent that lives on a two-dimensional map
	 * Its population can grow or shrink depending on the conditions.
	 *
	 * It knows how to draw itself, but most importantly it can decide on an action every tick.
	 *
	 * If certain conditions are met, the tribe may decide to {@link #colonize} a neighboring tile.
	 *
	 * Otherwise, the tribe may decide to {@link #move} to a better spot. A random move may be taken if the tribe 'panics', meaning its {@link #temperature} goes over a certain limit.
	 *
	 * The temperature is reset after an action is performed. How long it takes before the tribe panics depends on its {@link #patience}.
	 * 
	 * @param {Object} config
 	 * @constructs
	 */
	init : function (config)
	{
		console.assert(config.tile, 'tile expected in config');

		this.world = config.world;
		this.population = config.population;
		this.tile = config.tile;
		this.culture = config.culture;
		this.group = this.tile.el.parent.group();
		this.group.addClass('tribe' + this.population.toFixed(2));
		this.mask = this.tile.el.clone();
		this.mask.addClass('tribe');
		this.group.add(this.mask);
		this.text = this.group.text('');
		this.lastDecision = 0;
		this.temperature = 0;
		this.lastConfig = config;
		this.patience = config.patience || ((Math.random()*0.8 + 0.2)*this.maxPatience);

		var position = this.world.grid.gridToCoords(this.tile.gridPos);

		// this.text.y(-this.world.grid.hexBounds.height/3);
		this.group.transform({
			x : position[0],
			y : position[1]
		});
		this.mask.transform({
			x : 0, y : 0
		});

		return this;
	},

	/**
	 * Get the tribe's color as an SVG.Color
	 * The color is determined by the tribe's attributes
	 * @return {SVG.Color}
	 */
	getColor : function ()
	{
		return new SVG.Color(utils.hsvToRgb({
			h : this.culture,
			s : this.population/HexWorld.maxPopulation*0.8 + 0.1,
			v : (this.patience/(this.maxPatience))*0.8 + 0.2
		}));
	},

	/**
	 * Draw the tribe
	 * Update the mask with the current color
	 * Update the text if this option is enabled
	 */
	draw : function ()
	{
		var color = this.getColor();
		this.mask.style({
			fill : color.toHex(),
			stroke : '#ffffff'
		});

		if (this.showTextFlag) this.text.text(this.getText());
	},

	/**
	 * Get the tribe's text to be shown on top of its tile
	 * @return {String}
	 */
	getText : function()
	{
		var txtArray = [
			'p:' + this.population,
			't:' + this.temperature
		];

		return txtArray.join('\n');
	},

	/**
	 * Hide the text overlay
	 */
	hideText : function()
	{
		this.text.hide();
	},

	/**
	 * Show the text overlay
	 */
	showText : function()
	{
		this.text.show();
	},

	/**
	 * Decide what to do
	 * @param {Number} time The current time (in frames since the start)
	 */
	decide : function (time)
	{
		this.population = Math.min(
			this.population + Math.floor(this.getGrowth(this.tile)*this.population),
			HexWorld.maxPopulation
		);

		if (time - this.lastDecision < Tribe.decisionPeriod) {
			this.temperature += 1;
			return;
		}
		// console.log(this.population, 'population');
		// console.log(this.tile.value, 'yield');
		// console.log(this.population, 'new population');

		var gains = [];
		var currentGain = this.calculateGain(this.tile);

		gains.push({
			gain : currentGain,
			tile : this.tile
		});

		var neighbors = this.getNeighbors();
		var tribe = this;

		gains = neighbors.reduce(function (previous, item) {
			if (previous && item.value) {
				previous.push({
					gain : tribe.calculateGain(item),
					tile : item
				});
			}
			return previous;
		}, gains);

		gains = gains.sort(function (a, b) {
			// sort in descending order
			// first item has highest gain
			return b.gain - a.gain;
		});

		if (this.temperature > this.patience || gains[0].gain > currentGain) {
			for (var i = 0; i < gains.length; i++) {

				if (this.world.tileElToTribe.has(gains[i].tile.el)) {
					// fighting will be around here
					this.temperature = 0;
					continue;
				}

				if ((gains[i].gain > currentGain) || Math.random() > 0.8) {
					// console.log(gains[i].tile);
					// console.log(this.tile);
					this.move(gains[i].tile);
					this.lastDecision = time;
					this.temperature = 0;
					return;
				}

				if (this.population >= HexWorld.maxPopulation*0.7 &&
					(gains[i].gain >= currentGain) ||
					((gains[i].gain >= (currentGain/2) && Math.random() > 0.7))
				) {
					this.colonize(gains[i].tile);
					this.lastDecision = time;
					this.temperature = 0;
					return;
				}
			}
		}
		
		this.temperature += 1;
	},

	/**
	 * Clean up things on death
	 */
	die : function ()
	{
		if (this.neighborsGroup) {
			this.neighborsGroup.remove();
		}
		this.group.remove();
	},

	/**
	 * Move tribe to a tile
	 * @param {Tile} targetTile
	 */
	move : function (targetTile)
	{
		console.assert(this.tile !== targetTile);
		console.assert(!this.world.tileElToTribe.has(targetTile.el));

		this.tile.el.removeClass('occupied');
		// FIXME
		this.world.tileElToTribe.delete(this.tile.el);

		var newPos = this.world.grid.gridToCoords(targetTile.gridPos);

		// move the actual elements
		this.group.transform({
			x : newPos[0],
			y : newPos[1]
		});

		this.tile = targetTile;
		// FIXME: this coupling sucks
		this.world.tileElToTribe.set(this.tile.el, this);
	},

	/**
	 * Colonize a tile
	 * @param {Tile} targetTile
	 */
	colonize : function (targetTile)
	{
		console.assert(this.tile !== targetTile);
		console.assert(!this.world.tileElToTribe.has(targetTile.el));
		// console.log('colonizing from ' + this.tile.gridPos.toString() + ' to ' + targetTile.gridPos.toString());

		var config = Object.create(this.lastConfig);
		
		config.tile = targetTile;
		config.world = this.world;
		config.population = Math.floor(Tribe.colonyPopulationFraction * this.population);
		config.culture = this.culture;
		config.patience = this.patience;
		config.temperature = 0;

		var colony = Object.create(Tribe).init(config);

		this.world.addTribe(colony);
		colony.draw();
		this.population = Math.floor((1 - Tribe.colonyPopulationFraction) * this.population);
	},

	/**
	 * Calculate the gain of a tile
	 * Currently only considers population growth
	 * @param {Object} tile
	 */
	calculateGain : function (tile)
	{
		var growth = this.getGrowth(tile);
		return growth;
	},

	/**
	 * Calculate the growth on a tile
	 * This depends on the tile's yield and the current population
	 * @param {Tile} tile
	 * @return {Number}
	 */
	getGrowth : function (tile)
	{
		return utils.getLogistic(
			Tribe.maxStarve,
			Tribe.maxGrowth,
			Tribe.growthRate,
			Tribe.growthAsymptote,
			// Math.sqrt(tile.value*this.population)/HexWorld.maxPopulation
			(tile.value + this.population)/(2*HexWorld.maxPopulation)
		);
	},

	/**
	 * TODO: cache neighbours and invalidate only on actions
	 * @return {Tile[]} the neighbouring tiles
	 */
	getNeighbors : function ()
	{
		return this.world.grid.getNeighbors(this.tile);
	},

	/**
	 * Mark neighbors - this is mostly used for debugging atm, but
	 * should become a regular feature
	 */
	markNeighbors : function ()
	{

		var neighbors = this.getNeighbors();

		if (!this.neighborsGroup) {
			this.neighborsGroup = this.world.grid.ctx.group();			
		}

		for (var j = 0; j < neighbors.length; j++) {
			if (!this.world.tileElToTribe.has(neighbors[j].el))
			{
				// if unpopulated
				var overlay = neighbors[j].el.clone();
				// this.neighborsGroup.add(overlay);
				overlay.style({
					fill : '#a11',
					opacity : 0.4
				});
			} else {
				// do smth else
			}
		}
		this.neighborsGroup.addClass('neighborOverlay');
	},

	/**
	 * unmark neighboring tiles by clearing the svg group
	 */
	unmarkNeighbors : function ()
	{
		if (this.neighborsGroup) {
			this.neighborsGroup.clear();
			this.neighborsGroup.removeClass('neighborOverlay');
		}
	}
};