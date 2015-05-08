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
		// create element in which svg will be inserted
		var rootEl = document.createElement('div');
		rootEl.id = 'hex';
		document.documentElement.appendChild(rootEl);

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

});