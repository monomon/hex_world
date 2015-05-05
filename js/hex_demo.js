document.addEventListener('DOMContentLoaded', function () {
	'use strict';

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