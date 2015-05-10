describe('hex_world', function() {
	var world;
	var defaultConfig = {
			width : 20, // tiles
			height : 20, // tiles
			tileRadius : 30, // px
			numTribes : 30,
			wrapX : true,
			elId : 'hex'
	};

	beforeEach(function() {
		// jasmine.getFixtures().fixturesPath = 'test';

		// loadFixtures('fixture.html');

		setFixtures('	<div id="hex">	</div>	<nav id="main" class="panel">		<div class="handle"></div>		<button name="start">start</button>		<button name="stop">stop</button>		<button name="reset">reset</button>		<ul id="tribeConfig" class="inputList">			<li><label for="maxGrowth">maxGrowth</label><input type="number" step="0.01" name="maxGrowth"></li>			<li><label for="maxStarve">maxStarve</label><input type="number" step="0.01" name="maxStarve"></li>			<li><label for="growthRate">growthRate</label><input type="number" step="0.01" name="growthRate"></li>			<li><label for="growthAsymptote">growthAsymptote</label><input type="number" step="0.01" name="growthAsymptote"></li>			<li><label for="decisionPeriod">decisionPeriod</label><input type="number" step="50" name="decisionPeriod"></li>			<li><label for="showText">show text<br>(might slow things down)</label><input type="checkbox" name="showText"></li>			<li><label for="showTerrain">light switch</label><input type="checkbox" name="showTerrain"></li>			<li><button name="newGrid">create new grid</button></li>		</ul>	</nav>	<form id="worldCreateForm" class="panel">		<h3>create a new world</h3>		<ul class="inputList">		    <li><label for="width">width</label><input type="number" name="width" value="20" placeholder=""></li>		    <li><label for="height">height</label><input type="number" name="height" value="20" placeholder=""></li>		    <li><label for="tileRadius">tileRadius</label><input type="number" name="tileRadius" value="30" placeholder=""></li>		    <li><label for="numTribes">numTribes</label><input type="number" name="numTribes" value="36" placeholder=""></li>		    <li><label for="wrapX">wrapX</label><input type="checkbox" checked name="wrapX"></li>		</ul>		<button type="submit">create</button>	</form>');
	});

	afterEach(function() {
		world.clear();
	});

	it('initializes correctly', function() {
		world = Object.create(HexWorld).init(defaultConfig);
		expect(world.tribes.length).toEqual(30);
		expect(world.tribes.length).toEqual(document.querySelectorAll('.occupied').length);
		expect(world.grid.tiles.length).toEqual(world.grid.width*world.grid.height);
	});

	describe('neighbors found correctly', function() {
		it('grid works with wraparound', function() {
			var testData = [{
				index : 0,
				numNeighbors : 4
			}, {
				index : defaultConfig.width*2 + 3,
				numNeighbors : 6
			}, {
				index : 10,
				numNeighbors : 4
			}, {
				index : defaultConfig.width*4,
				numNeighbors : 6
			}, {
				index : defaultConfig.width*14 + 10,
				numNeighbors : 6
			}, {
				// this shows a bug in the neighbor algorithm... needs to be fixed
				index : (defaultConfig.height-1)*defaultConfig.width + 19,
				numNeighbors : 4
			}];


			world = Object.create(HexWorld).init(defaultConfig);

			for (var i = 0; i < testData.length; i++) {
				var tile = world.grid.tiles[testData[i].index];
				var neighbors = world.grid.getNeighbors(tile);

				console.log('current position ' + tile.gridPos);

				// highlight tile and neighbors
				tile.el.style({
					fill : '#f00'
				});

				for (var j = 0; j < neighbors.length; j++) {
					neighbors[j].el.style({
						fill : '#abc'
					});
					console.log('comparing against ' + neighbors[j].gridPos);
					expect(
						tile.gridPos[1] - neighbors[j].gridPos[1]
					).not.toBeGreaterThan(1);

					// check that distance is kept
					// consider wraparound case
					expect(
						Math.min(
							Math.abs(tile.gridPos[0] - neighbors[j].gridPos[0]),
							defaultConfig.width - Math.abs(tile.gridPos[0] - neighbors[j].gridPos[0])
						)
					).not.toBeGreaterThan(1);
				}

				expect(neighbors.length).toEqual(testData[i].numNeighbors);
			}	
		});

		it('grid works without wraparound', function() {
			var testData = [{
				index : 0,
				numNeighbors : 2
			}, {
				index : defaultConfig.width*2 + 3,
				numNeighbors : 6
			}, {
				index : 10,
				numNeighbors : 4
			}, {
				index : defaultConfig.width*4,
				numNeighbors : 3
			}, {
				index : defaultConfig.width*14 + 10,
				numNeighbors : 6
			}, {
				index : defaultConfig.width*(defaultConfig.height-1),
				numNeighbors : 3
			}, {
				index : (defaultConfig.height-1)*defaultConfig.width + 19,
				numNeighbors : 2
			}];


			var config = Object.create(defaultConfig);
			config.wrapX = false;
			world = Object.create(HexWorld).init(config);

			for (var i = 0; i < testData.length; i++) {
				var tile = world.grid.tiles[testData[i].index];
				var neighbors = world.grid.getNeighbors(tile);

				// highlight tile and neighbors
				tile.el.style({
					fill : '#f00'
				});

				for (var j = 0; j < neighbors.length; j++) {
					neighbors[j].el.style({
						fill : '#abc'
					});
					// check that distance is kept
					expect(Math.abs(neighbors[j].gridPos[0] - tile.gridPos[0])).not.toBeGreaterThan(1);
				}

				expect(neighbors.length).toEqual(testData[i].numNeighbors);
			}
		});

	});

	describe('GUI', function () {
		// mock the menu html
		beforeEach(function () {
			world = Object.create(HexWorld).init(defaultConfig);

			var ui = Object.create(WorldControls).init({
				world : world,
				rootEl : document.querySelector('nav#main'),
				outputEl : document.querySelector('.stats')
			});
		});

		it('can click all buttons without throwing an exception', function () {
			var buttons = [
				document.querySelector('button[name=start]'),
				document.querySelector('button[name=stop]'),
				document.querySelector('button[name=reset]')
			];


			buttons.forEach(function(item) {
				// console.log(item.click);
				function clickButt () {
					return item.click();
				}
				expect(clickButt).not.toThrow();
			});
		});

		it('can turn off the light', function () {
			function clickButt () {
				return document.querySelector('input[name=showTerrain]').click();
			}

			expect(clickButt).not.toThrow();
			expect(clickButt).not.toThrow();
		});
	});
});