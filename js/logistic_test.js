document.addEventListener('DOMContentLoaded', function (evt) {

	var width = 400;
	var height = 200;
	var svgCtx = SVG('hex');
	var plotLine = svgCtx.polyline().style({'fill' : 'none', 'stroke' : '#fff'});
	var points = [];

	var tileValue = 130;

	for (var i = 0; i < 1; i+=0.01) {
		points.push([i*width, getLogistic(
			Tribe.maxGrowth,
			Tribe.maxStarve,
			Tribe.growthRate,
			Tribe.growthAsymptote,
			(i*HexWorld.maxPopulation + tileValue)/(HexWorld.maxPopulation*2)
		)*height]);
	}

	plotLine.plot(points);
});