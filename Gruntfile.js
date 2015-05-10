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
			beforeconcat : ['js/*.js']
		},
		uglify: {
			options : {
				banner : '/*\n<%= pkg.name %> <%= pkg.version %>\n<%= pkg.authors %>\n<%= grunt.template.today("yyyy-mm-dd") %>\n*/\n'
			},
			build : {
				src : [
				'js/utils.js',
				'js/hex_grid.js',
				'js/hex_world.js',
				'js/world_controls.js',
				'js/tribe.js'
				],
				dest : 'js/dist/hex_world.min.js'
			}
		},
		// package for deployment
		copy: {
			package: {
				files: [
					{
						expand: true,
						flatten: true,
						src: ['js/dist/*', 'js/hex_demo.js'],
						dest: 'dist/js/'
					}, {
						expand: true,
						flatten: true,
						src: [
							'bower_components/jquery/dist/jquery.min.js',
							'bower_components/svg.js/dist/svg.min.js'
						],
						dest: 'dist/vendor/'
					}, {
						expand: true,
						src: ['index.html', 'hex.css'],
						dest: 'dist'
					}, {
						expand: true,
						src: ['doc/**'],
						dest: 'dist'
					}
				]
			}
		},

		clean: {
			build : ['js/dist'],
			dist : ['dist'],
			doc : ['doc']
		},

		jsdoc : {
			default : {
				src : 'js/*.js',
				dest : 'doc'
			}
		},

		karma : {
			default : {
				options : {
					configFile : 'karma.conf.js',
					browsers : ['Firefox'] // svg doesn't work in PhantomJS
				}
			}
		},

		processhtml : {
			build : {
				files : {
					'index_dev.html' : ['index_src.html']
				}
			},
			dist : {
				files : {
					'index.html' : ['index_dev.html']
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-jsdoc');
	grunt.loadNpmTasks('grunt-karma');
	grunt.loadNpmTasks('grunt-processhtml');

	grunt.registerTask('build', [
		'jshint:beforeconcat',
		'karma',
		'jsdoc',
		'uglify',
		'processhtml:build'
	]);

	grunt.registerTask('dist', [
		'processhtml:dist',
		'copy:package'
	]);
};
