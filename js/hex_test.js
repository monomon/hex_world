function testWorldWrap ()
{
	var world = Object.create(HexWorld).init({
		width : 20, // tiles
		height : 20, // tiles
		tileRadius : 30, // px
		numTribes : 30,
		wrapX : true
	});

	console.assert(world.tribes.length == 30);
	console.assert(document.querySelectorAll('.occupied').length == world.tribes.length);
	console.assert(world.grid.tiles.length == world.grid.width*world.grid.height);

	var testData = [{
		index : 0,
		numNeighbors : 4
	}, {
		index : world.grid.width*2 + 3,
		numNeighbors : 6
	}, {
		index : 10,
		numNeighbors : 4
	}, {
		index : world.grid.width*4,
		numNeighbors : 6
	}, {
		index : world.grid.width*14 + 10,
		numNeighbors : 6
	}, {
		// this shows a bug in the neighbor algorithm... needs to be fixed
		index : (world.grid.height-1)*world.grid.width + 19,
		numNeighbors : 4
	}];

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
		}

		console.assert(neighbors.length == testData[i].numNeighbors, 'Number of neighbors should be ' + testData[i].numNeighbors + ' but is ' + neighbors.length + ' for index ' + testData[i].index);
	}

	console.log('test complete');
}

function testWorldNoWrap()
{

	var world = Object.create(HexWorld).init({
		width : 20, // tiles
		height : 20, // tiles
		tileRadius : 30, // px
		numTribes : 30,
		wrapX : false
	});

	var testData = [{
		index : 0,
		numNeighbors : 2
	}, {
		index : world.grid.width*2 + 3,
		numNeighbors : 6
	}, {
		index : 10,
		numNeighbors : 4
	}, {
		index : world.grid.width*4,
		numNeighbors : 3
	}, {
		index : world.grid.width*14 + 10,
		numNeighbors : 6
	}, {
		index : world.grid.width*(world.grid.height-1),
		numNeighbors : 3
	}, {
		index : (world.grid.height-1)*world.grid.width + 19,
		numNeighbors : 2
	}];

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
		}

		console.assert(neighbors.length == testData[i].numNeighbors, 'Number of neighbors should be ' + testData[i].numNeighbors + ' but is ' + neighbors.length + ' for index ' + testData[i].index);
	}

	console.log('test complete');
}

document.addEventListener('DOMContentLoaded', function () {
	'use strict';
	var rootEl = document.getElementById('hex');
	testWorldWrap();
	rootEl.removeChild(rootEl.querySelector('svg'));
	testWorldNoWrap();
	rootEl.removeChild(rootEl.querySelector('svg'));

	/* default config */
	var config = {
		width : 20, // tiles
		height : 20, // tiles
		tileRadius : 30, // px
		numTribes : 36,
		wrapX : true,
		elId : 'hex'
	};

	var fieldNames = ['width', 'height', 'tileRadius', 'numTribes'];

	for (var i = 0; i < fieldNames.length; i++) {
		var param = getParameterByName(fieldNames[i]);

		if (param) {
			config[fieldNames[i]] = param;
		}
	}

	var wrapX = getParameterByName('wrapX') == 'on';
	config.wrapX = wrapX;

	var world = Object.create(HexWorld).init(config);

	var controls = Object.create(WorldControls).init({
		world : world,
		rootEl : document.querySelector('nav#main'),
		outputEl : document.querySelector('.stats')
	});
});