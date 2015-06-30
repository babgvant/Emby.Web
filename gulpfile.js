'use strict';

var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();

gulp.task('server', function() {
  var browserSync = require('browser-sync');
  var historyApiFallback = require('connect-history-api-fallback');

  var config = {
      ui: { port: 3003 },
      port: 8008,
      host: 'localhost',
      open: 'external',
      files: './**',
      server: {
        baseDir: './',
        middleware: [ historyApiFallback() ]
      },
      startPath: '/',
  };

  // Launch Server
  browserSync(config);
});

gulp.task('default', ['server']);
