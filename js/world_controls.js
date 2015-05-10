/**
 * @lends WorldControls#
 */
var WorldControls = {
	/**
	 * GUI controls for the HexWorld
	 * Allow setting parameters on the simulation,
	 * controlling the playback, etc.
	 * @param {Object} config
	 * @constructs
	 */
	init : function(config)
	{
		this.world = config.world;
		this.rootEl = config.rootEl;
		this.outputEl = config.outputEl;
		this.initControls(config);
	},
	/**
	 * Hook up input elements to their handlers
	 * @param {Object} config
	 */
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

		var showTerrainCheck = this.rootEl.querySelector('#tribeConfig input[name="showTerrain"]');

		showTerrainCheck.addEventListener('click', function (evt) {
			// detect change; the change event is weird...
			if (!world.grid.showTerrainFlag && evt.target.checked) {
				world.grid.showTerrain.call(world.grid);
			} else if (world.grid.showTerrainFlag && !evt.target.checked) {
				world.grid.hideTerrain.call(world.grid);
			}
		});

		showTerrainCheck.checked = HexGrid.showTerrainFlag;

		// handle toggles visibility of controls
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