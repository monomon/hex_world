module.exports = function(config)
{
	config.set({
		frameworks : ['jasmine'],
		files: [
			'bower_components/jquery/dist/jquery.js',
			'node_modules/jasmine-jquery/lib/jasmine-jquery.js',
			'bower_components/svg.js/dist/svg.js',
			'hex.css',
			'js/*.js',
			'test/*.js'
		],
		singleRun : true
	});
};