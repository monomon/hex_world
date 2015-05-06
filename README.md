![hex world](http://monomon.me/hex_world/hex_world.png)

# hex_world

An artificial life simulation

[live demo](http://monomon.me/hex_world)

## Introduction

hex_world is a 'zero-player' game. Automated agents run around in this world, trying to achieve better conditions. Patterns emerge that depend on how the terrain is configured.

The hex_world consists of a hexagonal grid. Every tile has a yield value - how much 'food' it provides. This is randomly determined at initialization time and displayed by coloring the tiles in grayscale - the amount of food produced on the tile is proportional to the color value, the higher the yield the lighter the tile.

Tribes are initially placed randomly on the map and drawn as colored hexagons. They aim to maximize their gain by moving to 'higher ground' or by colonizing neighboring tiles.

In the original simulation, color hue determined the 'culture' of a tribe. Tribes with similar cultures would be more likely to cooperate (e.g. share food). This is still TODO.


## Growth

Tribes grow depending on their population and yield of the tile they are on. Growth is calculated from a [Generalised logistic function](https://en.wikipedia.org/wiki/Generalised_logistic_function).

![growth plot](http://monomon.me/hex_world/growthplot.png)

Growth is a factor by which the population changes. e.g. a growth of 1 means 100% population increase.

Growth parameters can be controlled via the provided GUI or set directly on the corresponding classes (e.g. HexWorld, Tribe).

Looking at the graph, one could argue that more population in fact leads to lower growth (e.g. due to resource depletion). On the flipside, this also leads to more production capacity.
If these two effects cancel each other, then population size might not matter. The growth function should be made configurable in the future.

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

Controls are created separately, to make it easier to create standalone worlds, and to make the coupling with the world looser.

## Drawing

[svg.js](https://github.com/wout/svg.js.git) is used for the drawing.

## TODO

* bug where tribes colonize on tiles 1 tile away - should be only immediate neighbors
* plot populations and other parameters against time
* implement violence
* implement cooperation - similar 'cultures' (i.e. how close their hues are)
* better terrain generation, use Perlin noise or smth
