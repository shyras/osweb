/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var gulp = require('gulp');
var gutil = require('gulp-util')
var sass = require('gulp-sass');
var cleanCSS = require('gulp-clean-css');
var concat = require('gulp-concat');
var wrapJS = require("gulp-wrap-js");
var uglify = require('gulp-uglify');
var notify = require("gulp-notify");
var sourcemaps = require('gulp-sourcemaps');
var browserify = require('browserify');
var watchify = require('watchify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer')
var del = require('del');
var browserSync = require('browser-sync').create();

var debug = true;

var config = {
  browserify : {
    entries: ['./src/js/osweb/main.js'],
    standalone: 'osweb', 
    debug: debug,
    cache: {}, // required for watchify
    packageCache: {}, // required for watchify
  },
  browserSync : {
    server: "./public_html",
    logFileChanges: false
  },
  js : {
    dest_dir: './public_html/js',
    dest_file: 'osweb.js',
    dependencies: [
      'src/js/dependencies/jquery.min.js',
      'src/js/dependencies/bootsrap.min.js',
      'src/js/dependencies/*.js',
    ]
  },
  css : {
    dest_dir: './public_html/css',
    dest_file: 'osweb.css',
    styles:[
      'src/scss/*.scss',
      'src/scss/*.css'
    ]
  }
}

function handleErrors() {
  var args = Array.prototype.slice.call(arguments);
  notify.onError({
    title: "Compile Error",
    message: "<%= error.message %>"
  }).apply(this, args);
  this.emit('end'); // Keep gulp from hanging on this task
}

// Bundle function, when true watchify it.

function build_osweb(watch){
  var bundler, rebundle;
  config.browserify.fullPaths = watch // required to be true only for watchify

  bundler = browserify(config.browserify);
  if(watch) {
    bundler = watchify(bundler) 
  }

  rebundle = function() {
    return bundler.bundle()
      .on('error', handleErrors)
      .pipe(source(config.js.dest_file))
      .pipe(buffer())
      .pipe(sourcemaps.init({loadMaps: true})) // loads map from browserify file
        //.pipe(uglify())
      .pipe(sourcemaps.write())
      .pipe(gulp.dest(config.js.dest_dir))
      .pipe(browserSync.stream()); //reload webpage in browser
  };

  bundler.on('update', function(){
    rebundle();
    gutil.log('Rebundling osweb...');
  });
  bundler.on('log', gutil.log); // output build logs to terminal
  return rebundle();
}

// Gulp tasks

gulp.task('js-osweb', function(){
    return build_osweb(false);    
});

gulp.task('js-interface', function() {
    return gulp
        .src(config.js.dependencies)
        .on('error', handleErrors)
        .pipe(sourcemaps.init())
          //.pipe(uglify())
            .pipe(concat('interface.js'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(config.js.dest_dir))
        .pipe(browserSync.stream()); //reload webpage in browser
});

gulp.task('css', function() {
    return gulp
        .src(config.css.styles)
        .pipe(sass().on('error', handleErrors))
        .pipe(sourcemaps.init())
            .pipe(cleanCSS())
            .pipe(concat(config.css.dest_file))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(config.css.dest_dir))
        .pipe(browserSync.stream()); //reload webpage in browser
});

gulp.task('js', ['js-interface','js-osweb']);

gulp.task('build', ['js','css']);

// Rerun the task when a file changes
gulp.task('watch', function() {
    gulp.watch(config.js.dependencies, ['js-interface'])
    gulp.watch(config.css.styles, ['css']);
    gulp.watch("public_html/*.html").on('change', browserSync.reload);
    build_osweb(true);
    // Start webserver
    browserSync.init(config.browserSync);
});

gulp.task('default', ['css','js-interface','watch']);
