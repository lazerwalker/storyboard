'use strict';

var fs = require('fs');
var watchify = require('watchify');
var browserify = require('browserify');
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var gutil = require('gulp-util');
var babelify = require('babelify')
var babel = require('gulp-babel')

var customOpts = {
  entries: ['./src/game.js'],
  standalone: "Game"
};

var opts = Object.assign({}, watchify.args, customOpts);

var browser = browserify(opts)
browser.transform(babelify)

var browserWatch = watchify(browserify(opts));
browserWatch.transform(babelify)


gulp.task('default', browserBundle);
gulp.task('browser', browserBundle);
gulp.task('node', nodeBundle)

gulp.task('watch', watchBundle)
browserWatch.on('update', watchBundle); // on any dep update, runs the bundler

browser.on('log', gutil.log); // output build logs to terminal
browserWatch.on('log', gutil.log); // output build logs to terminal

function browserBundle() {
  return browser.bundle()
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(fs.createWriteStream("dist.js"));
}

function nodeBundle() {
return gulp.src("src/**/*.js")
  .pipe(babel())
  .pipe(gulp.dest('lib/'))
  .on('error', gutil.log.bind(gutil, 'Browserify Error'))
}

function watchBundle() {
  return browserWatch.bundle()
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(fs.createWriteStream("dist.js"));
}