'use strict';

var HexWorld = {
	tileElToTribe : undefined,
	populationInitModifier : 150,
	maxPopulation : 255,

	init : function(config)
	{
		this.grid = Object.create(HexGrid).init(config);
		this.startTime = null;

		this.initTribes(config);
		this.lastConfig = config;
		return this;
	},

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

	removeTribe : function(tribe)
	{
		this.tribes.splice(this.tribes.indexOf(tribe), 1);
		this.tileElToTribe.delete(tribe.tile.el);
	},

	/**
	 * Get random tiles from the grid until
	 * an unpopulated one is found
	 * @return {Object} tile
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

	getRandomPopulation : function()
	{
		return Math.floor((((0.5 + Math.random())*0.5)*this.populationInitModifier));
	},

	/**
	 * Update on a tick
	 * First run one round of decision for all tribes,
	 * Then update all tribes with their new state
	 * Dead tribes are cleaned up
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

	stop : function()
	{
		cancelAnimationFrame(this.animRequestId);
	},

	reset : function()
	{
		cancelAnimationFrame(this.animRequestId);
		this.clear();
		this.init(this.lastConfig);
		this.startTime = 0;
	},

	clear : function()
	{
		this.grid.ctx.clear();
		this.grid.tiles = [];
		this.tribes = [];
		this.tileElToTribe = undefined;
		this.grid.ctx.node.remove();
	}
};

var WorldControls = {
	init : function(config)
	{
		this.world = config.world;
		this.rootEl = config.rootEl;
		this.outputEl = config.outputEl;
		this.initControls(config);
	},

	initControls : function(config)
	{
		var startButton = this.rootEl.querySelector('[name=start]');
		var outputEl = this.outputEl;
		startButton.addEventListener('click', function () {
			config.world.play.call(config.world);
		});
		var stopButton = this.rootEl.querySelector('[name=stop]');
		stopButton.addEventListener('click', function () {
			config.world.stop.call(config.world);
		});
		var resetButton = this.rootEl.querySelector('[name=reset]');
		resetButton.addEventListener('click', function () {
			config.world.reset.call(config.world);
		});

		var inputEls = this.rootEl.querySelectorAll('#tribeConfig input[type="number"]');

		function updateTextInput (evt)
		{
			Tribe[evt.target.name] = evt.target.value;
		}

		for (var i = 0; i < inputEls.length; i++) {
			var el = inputEls.item(i);
			el.value = Tribe[el.name];

			el.addEventListener('change', updateTextInput);
		}

		var showTextCheck = this.rootEl.querySelector('#tribeConfig input[name="showText"]');

		var world = this.world;

		showTextCheck.addEventListener('click', function (evt) {
			if (!Tribe.showTextFlag && evt.target.checked) {
				for (var i = 0; i < world.tribes.length; i++) {
					world.tribes[i].showText();
				}
			} else if (Tribe.showTextFlag && !evt.target.checked) {
				for (var i = 0; i < world.tribes.length; i++) {
					world.tribes[i].hideText();
				}
			}

			Tribe.showTextFlag = evt.target.checked;
		});

		// prime with current value
		Tribe.showTextFlag = showTextCheck.checked;

		this.rootEl.querySelector('.handle').addEventListener('click', function (evt) {
			$('#tribeConfig').toggle();
			$(evt.target).toggleClass('active');
		});

		var newGridButton = this.rootEl.querySelector('button[name=newGrid]');

		function createNewWorld(form)
		{
			var formData = getParameters(form);
			world.init(formData);
		}

		function openCreateWorldDialog()
		{
			var form = document.getElementById('worldCreateForm');
			form.style.display = 'block';
			// let the form submit to the same page
			// query string will be used for parametrs
		}

		newGridButton.addEventListener('click', function (evt) {
			world.clear();
			openCreateWorldDialog();
		});
	}
};