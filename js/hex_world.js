/**
 * @lends HexWorld#
 */
var HexWorld = {
	tileElToTribe : undefined,
	populationInitModifier : 150,
	maxPopulation : 255,

	/**
	 * Represents the world on a hexagonal grid
	 * - Keeps track of tribes, some supervision
	 * - Allows playback control
	 * - glues tribes and the grid
	 *
	 * @param {Object} config
	 * @constructs
	 */
	init : function(config)
	{
		this.grid = Object.create(HexGrid).init(config);
		this.startTime = null;

		this.initTribes(config);
		this.lastConfig = config;
		return this;
	},

	/**
	 * Initialize tribes with configuration
	 * @param {Object} config
	 */
	initTribes : function(config)
	{
		// reset mapping
		this.tileElToTribe = new WeakMap();
		this.tribes = [];

		for (var i = 0; i < config.numTribes; i++) {
			this.addTribe(this.createRandomTribe());
		}
	},

	/**
	 * generate a random tribe with random population and on a random tile
	 * @return {Tribe}
	 */
	createRandomTribe : function()
	{
		return Object.create(Tribe).init({
			population : this.getRandomPopulation(),
			culture : Math.random(),
			tile : this.getRandomUnoccupiedTile(),
			world : this
		});
	},

	/**
	 * Add the passed tribe to some collections
	 * redraw the tribe
	 * @param {Object} config
	 */
	addTribe : function(tribe)
	{
		this.tribes.push(tribe);

		this.tileElToTribe.set(
			tribe.tile.el,
			tribe
		);

		tribe.tile.el.addClass('occupied');
		tribe.draw();
	},

	/**
	 * Remove a tribe from the collections
	 * @param {Tribe} tribe
	 */
	removeTribe : function(tribe)
	{
		this.tribes.splice(this.tribes.indexOf(tribe), 1);
		this.tileElToTribe.delete(tribe.tile.el);
	},

	/**
	 * Get random tiles from the grid until
	 * an unpopulated one is found
	 * @return {Tile} tile
	 */
	getRandomUnoccupiedTile : function()
	{
		var tile = this.grid.getRandomTile();

		// test against map
		while (this.tileElToTribe.get(tile.el) !== undefined) {
			tile = this.grid.getRandomTile();
		}

		return tile;
	},

	/**
	 * Convenience method to calculate a random population, its bounds
	 * determined by some modifiers
	 * @return {Number}
	 */
	getRandomPopulation : function()
	{
		return Math.floor((((0.5 + Math.random())*0.5)*this.populationInitModifier));
	},

	/**
	 * Update on a tick
	 * First run one round of decision for all tribes,
	 * Then update all tribes with their new state
	 * Dead tribes are cleaned up
	 *
	 * @param {Number} time
	 */
	update : function(time) {
		var tribe;
		for (var i = 0; i < this.tribes.length; i++) {
			tribe = this.tribes[i];
			tribe.decide(time);
		}

		for (var i = 0; i < this.tribes.length; i++) {
			tribe = this.tribes[i];
			if (tribe.population <= 0) {
				tribe.die();
				this.removeTribe(tribe);
			} else {
				tribe.draw();
			}
		}
	},

	/**
	 * Start the simulation
	 */
	play : function()
	{
		var world = this;
		(function animationLoop(time) {
			world.update.call(world, time);
			if (world.startTime === null) {
				world.startTime = time;
			}
			world.animRequestId = requestAnimationFrame(animationLoop);
		})(0);
	},

	/**
	 * Pause the simulation
	 */
	stop : function()
	{
		cancelAnimationFrame(this.animRequestId);
	},

	/**
	 * Reset the simulation. Clears the current one
	 * and reinitializes with last config
	 */
	reset : function()
	{
		cancelAnimationFrame(this.animRequestId);
		this.clear();
		this.init(this.lastConfig);
		this.startTime = 0;
	},

	/**
	 * Clean up various collections and resources
	 * FIXME: is WeakMap cleaned like that?
	 */
	clear : function()
	{
		this.grid.ctx.clear();
		this.grid.tiles = [];
		this.tribes = [];
		this.tileElToTribe = undefined;
		this.grid.ctx.node.remove();
	}
};
