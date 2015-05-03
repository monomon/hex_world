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
			afterconcat : ['js/dist/*.js'],
		},
		uglify: {
			options : {
				banner : '/*\n<%= pkg.name %>\n<%= pkg.authors %>\n*/\n'
			},
			build : {
				src : [
				'js/utils.js',
				'js/hex_grid.js',
				'js/hex_world.js',
				'js/tribe.js'
				],
				dest : 'js/dist/hex_world.min.js'
			}
		},
		// package for deployment
		copy: {
			main: {
				files: [
					{
						expand: true,
						src: ['js/dist/*'],
						dest: 'dist/'
					}, {
						expand: true,
						src: ['js/hex_test.js'],
						dest: 'dist/'
					}, {
						expand: true,
						flatten: true,
						src: [
							'bower_components/jquery/dist/jquery.min.js',
							'bower_components/svg.js/dist/svg.js'
						],
						dest: 'dist/vendor/'
					}, {
						expand: true,
						src: ['index.html', 'hex.css'],
						dest: 'dist'
					}
				]
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-copy');

	grunt.registerTask('default', ['jshint:beforeconcat', 'uglify', 'jshint:afterconcat']);
	grunt.registerTask('dist', ['default', 'copy']);
};
