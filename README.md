# hex_world

An artificial life simulator

## Introduction

The hex_world consists of a hexagonal grid. Every tile has a yield value - how much 'food' it provides. This is randomly determined at initialization time.

Tribes are initially placed randomly on the map. They aim to maximize their gain by moving to 'higher ground' or by colonizing neighboring tiles.

## Drawing

[svg.js](https://github.com/wout/svg.js.git) is used for the drawing.

## TODO

* bug where tribes colonize on tiles 1 tile away - should be only immediate neighbors
* plot populations against time
* implement violence
