/*global module:false*/
module.exports = function(grunt) {
	var name    = '<%= pkg.name %>-v<%= pkg.version%>',
			manifest = { '<%= prod.CSS %>layout.min.css': [  '<%= app.LESS %>normalize.less', '<%= app.LESS %>base-*.less'],
									 '<%= prod.CSS %>dxrxt.css': '<%= app.LESS %>global.less'};

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		app: {
			root: 'app/',
			LESS: 'app/less/',
			IMG: {
				root: 'app/img/',
				dist: 'app/img/dist/',
				src: 'app/img/src/',
			}
		},
		prod: {
			root: 'gh-pages/',
			IMG: 'gh-pages/img/',
			CSS: 'gh-pages/css/'
		},
		build: {
			root: 'build/',
			IMG: 'build/img/',
			CSS: 'build/css/'
		},
		bower: 'bower_components/',
		jshint: {
			gruntfile: {
				src: 'Gruntfile.js'
			}
		},
		less: {
			dev: {
				options: {
					path: '<%= app.LESS %>',
					cleancss: false
				},
				files: manifest
			},
			prod: {
				options: {
					path: '<%= app.LESS %>',
					compress: true,
					cleancss: true
				},
				files: manifest
			}
		},
		jsonlint: {
			sample: {
				src: [ '<%= app.root %>*.json' ]
			}
		},
		jade: {
			dev: {
				options: {
					data: function(dest, src) {
						// Return an object of data to pass to templates
						return require('./app/data.json');
					},
					pretty: true
				},
				files: {
					"<%= prod.root %>index.html": "<%= app.root %>index.jade"
				}
			}
		},
		htmlmin: {
			dist: {
				options: {
					removeComments: true,
					removeAttributeQuotes: true,
					useShortDocType: true,
					collapseWhitespace: true
				},
				files: {
					'<%= prod.root %>index.html': '<%= prod.root %>index.html'
				}
			}
		},
		tinyimg: {
			dynamic: {
				files: [{
					expand: true,
					cwd: '<%= app.IMG.src %>',
					src: ['*.{png,jpg}'],
					dest: '<%= app.IMG.root %>',
					flatten: true
				}]
			}
		},
		svgmin: {
			options: {
				plugins: [
					{ removeViewBox: false },
					{ removeUselessStrokeAndFill: true }
				]
			},
			dist: {
				files: [{
					expand: true,
					cwd: '<%= app.IMG.src %>',
					src: ['*.svg'],
					dest: '<%= app.IMG.root %>',
					flatten: true
				}]
			}
		},
		copy: {
			less: {
				expand: true,
				cwd: '<%= bower %>',
				src: [ 'normalize-less/normalize.less', 'lesshat/build/*.less'],
				dest: 'app/less/',
				flatten: true
			},
			fa: {
				expand: true,
				cwd: '<%= bower %>',
				src: ['fontawesome/less/variables.less'  ],
				dest: 'app/less/',
				flatten: true,
				rename: function(dest, src) {
       		return dest + src.replace( src , 'fa-' + src );
      	}
			},
			font: {
				expand: true,
				cwd: '<%= bower %>',
				src: ['fontawesome/fonts/fontawesome-webfont.*'  ],
				dest: '<%= prod.root %>font/',
				flatten: true
			},
			img: {
				expand: true,
				cwd: '<%= app.IMG.src %>',
				src: ['*.{png,jpg,svg}'],
				dest: '<%= prod.IMG %>',
				flatten: true
			}
		},
		connect: {
			server: {
				options: {
					port: '9001',
					base: 'gh-pages',
					protocol: 'http',
					hostname: 'localhost',
					livereload: true,
					open: {
						target: 'http://localhost:9001/', // target url to open
						appName: 'Chrome'
					},
				}
			}
		},
		bump: {
			options: {
				files: ['package.json', 'bower.json'],
				updateConfigs: [],
				commit: true,
				commitMessage: 'Release v%VERSION%',
				commitFiles: ['package.json', 'bower.json'],
				createTag: true,
				tagName: '%VERSION%',
				tagMessage: '%VERSION%',
				push: true,
				pushTo: 'origin',
				gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d',
				globalReplace: false
			}
		},
		buildcontrol: {
			options: {
				dir: 'gh-pages/',
				commit: true,
				push: true,
				message: 'Built %sourceName% from commit %sourceCommit% on branch %sourceBranch%'
			},
			pages: {
				options: {
					remote: 'git@github.com:additiveinverse/dxrxt.git',
					branch: 'gh-pages'
				}
			},
			local: {
				options: {
					remote: '../',
					branch: 'build'
				}
			}
		},
		'sftp-deploy': {
			build: {
				auth: {
					host: 'dxrxt.com',
					port: 22,
					authKey: 'key1'
				},
				cache: 'sftpCache.json',
				src: 'gh-pages/',
				dest: '/home/proemadmin/dxrxt.com',
				serverSep: '/',
				concurrency: 4,
				progress: true
			}
		},
		watch: {
			files: [
				'app/**/*',
				'Gruntfile.js'
			],
			tasks: [ 'jade', 'less:dev' ],
			options: {
				reload: false,
				livereload: true,
				spawn: true
			}
		}
	});

	require('matchdep').filterDev('grunt-*').forEach( grunt.loadNpmTasks );

	// Default
	grunt.registerTask('default', [ 'connect', 'watch' ]);

	// fresh
	grunt.registerTask('fresh', [ 'copy', 'jade', 'less:dev' ]);

	// compress
	grunt.registerTask('compress', [ 'tinyimg', 'svgmin', 'htmlmin' ]);

	// build
	grunt.registerTask('build', [ 'copy:img', 'jade', 'less:prod' ]);

	// deploy
	grunt.registerTask('deploy', [ 'build', 'compress', 'bump:minor', 'buildcontrol:pages',  ]);
};