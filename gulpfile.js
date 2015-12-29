'use strict';

var fs = require('fs');
var watchify = require('watchify');
var browserify = require('browserify');
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var gutil = require('gulp-util');
var babelify = require('babelify')

var customOpts = {
  entries: ['./src/game.js'],
  standalone: "Game"
};

var opts = Object.assign({}, watchify.args, customOpts);
var b = watchify(browserify(opts)); 
b.transform(babelify)


gulp.task('default', bundle); // so you can run `gulp js` to build the file
b.on('update', bundle); // on any dep update, runs the bundler
b.on('log', gutil.log); // output build logs to terminal

function bundle() {
  return b.bundle()
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(fs.createWriteStream("dist.js"));
}