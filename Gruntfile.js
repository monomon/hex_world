module.exports = function (grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('bower.json'),
		jshint : {
			options : {
				'-W004' : true,
				'-W097' : true,
				globals : {
					'$' : true,
					'Tribe' : true,
					'requestAnimationFrame' : true,
					'cancelAnimationFrame' : true,
					'WeakMap' : true,
					'HexGrid' : true,
					'getParameters' : true,
					'document' : true,
				}
			},
			beforeconcat : ['js/*.js'],
			afterconcat : ['js/build/*.js'],
		},
		uglify: {
			options : {
				banner : '/* hex_world: */\n'
			},
			build : {
				src : [
				'js/utils.js',
				'js/hex_grid.js',
				'js/hex_world.js',
				'js/tribe.js'
				],
				dest : 'js/build/hex_world.min.js'
			}
		},
  // Arbitrary non-task-specific properties.
  my_property: 'whatever',
  my_src_files: ['foo/*.js', 'bar/*.js'],
});
grunt.loadNpmTasks('grunt-contrib-jshint');
grunt.loadNpmTasks('grunt-contrib-uglify');
grunt.registerTask('default', ['jshint:beforeconcat', 'uglify', 'jshint:afterconcat']);
};
