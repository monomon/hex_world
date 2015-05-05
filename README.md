# hex_world

An artificial life simulation

[live demo](http://monomon.me/hex_world)

## Introduction

The hex_world consists of a hexagonal grid. Every tile has a yield value - how much 'food' it provides. This is randomly determined at initialization time.

Tribes are initially placed randomly on the map. They aim to maximize their gain by moving to 'higher ground' or by colonizing neighboring tiles.

## Growth

Tribes grow depending on their population and yield of the tile they are on. Growth is calculated from a [Generalised logistic function](https://en.wikipedia.org/wiki/Generalised_logistic_function).

Growth parameters can be controlled via the provided GUI or set directly on the corresponding classes (e.g. HexWorld, Tribe).

## Usage

To create a new world, simply call


	var world = Object.create(HexWorld).init({
		width : 20, // tiles
		height : 20, // tiles
		tileRadius : 30, // px
		numTribes : 36,
		wrapX : true,
		elId : 'hex'
	});

	var controls = Object.create(WorldControls).init({
		world : world,
			rootEl : document.querySelector('nav#main'),
		outputEl : document.querySelector('.stats')
	});

Controls are created separately, to make it easier to create standalone worlds, and to make the connection with the world looser.

## Drawing

[svg.js](https://github.com/wout/svg.js.git) is used for the drawing.

## TODO

* bug where tribes colonize on tiles 1 tile away - should be only immediate neighbors
* plot populations against time
* implement violence
* better terrain generation, use Perlin noise or smth
