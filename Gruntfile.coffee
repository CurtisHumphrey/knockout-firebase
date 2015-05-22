module.exports = (grunt) ->
  # Livereload and connect variables
  LIVERELOAD_PORT = 1337
  lrSnippet = require("connect-livereload")(port: LIVERELOAD_PORT)
  mountFolder = (connect, dir) ->
    connect.static require("path").resolve(dir)

  grunt.initConfig
    connect:
      dev:
        options:
          port: 9001
          hostname: 'localhost',
          middleware: ( connect ) ->
            [lrSnippet, mountFolder(connect, '.')]

    open:
      test:
        path: 'http://localhost:<%= connect.dev.options.port %>/_SpecRunner.html'

    jasmine:
      dev:
        options:
          specs: "test/specs/**/*.js"
          helpers: ["test/helpers/**/*.js"]
          keepRunner: true
          template: require "grunt-template-jasmine-requirejs"
          templateOptions:
            requireConfigFile: "dev/require_config.js"
            requireConfig:
              baseUrl: 'dev'

    requirejs:
      compile:
        options:
          baseUrl: 'dev'
          mainConfigFile: "dev/require_config.js"
          out: "dist/knockout_firebase.js"
          name: "knockout_firebase"
          optimize: 'none'
          paths:
            knockout: 'empty:'
            lodash: 'empty:'
            mockfirebase: 'empty:'


    exec:
      git:
        cmd: 'START "" "C:\\Program Files\\TortoiseGit\\bin\\TortoiseGitProc.exe" /command:log /path:..'

    coffee:
      compile_tests: 
        expand : true
        cwd     : 'test/specs'
        src    : ['**/*.coffee']
        dest   : 'test/specs'
        ext    : '.spec.js'
      compile_lib: 
        expand : true
        cwd     : 'dev'
        src    : ['**/*.coffee']
        dest   : 'dev'
        ext    : '.js'

    copy:
      dist:
        expand: true
        flatten: true
        src   : ['dev/fire_*.js']
        dest  : 'dist/'

    watch:
      configFiles:
        files: ['Gruntfile.coffee']
        options:
          reload: true
      reload_jasmine:
        files: ['test/specs/**/*.js','dev/**/*.js']
        tasks: ['jasmine:dev', 'requirejs', 'copy']
        options:
          livereload: 1337
      coffee_spec:
        files: ['test/specs/**/*.coffee']
        tasks: ['newer:coffee:compile_tests']
      coffee_lib:
        files: ['dev/**/*.coffee']
        tasks: ['newer:coffee:compile_lib']
        options:
          livereload: 35729

    bump:
      options:
        files: ['bower.json', 'package.json']
        commitFiles: ['bower.json', 'package.json']
        push: false
        commit: false

  require('time-grunt')(grunt)

  require('load-grunt-tasks')(grunt)
  
  grunt.registerTask 'git', ['exec:git']

  grunt.registerTask 'next_version', ['build','bump:patch']
  grunt.registerTask 'rerun', ['coffee', 'connect:dev:livereload', 'watch']
  grunt.registerTask 'dev', ['coffee', 'connect:dev:livereload', 'open', 'watch']
  grunt.registerTask 'build', ['coffee','jasmine','requirejs','copy']
  grunt.registerTask 'default', ['git', 'dev']
  grunt.registerTask 'test', ['coffee', 'jasmine']