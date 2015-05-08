module.exports = function(config)
{
	config.set({
		frameworks : ['jasmine'],
		files: [
			'bower_components/jquery/dist/jquery.js',
			'bower_components/svg.js/dist/svg.js',
			'js/*.js'
		]
	});
};