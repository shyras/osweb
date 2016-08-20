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
var sourcemaps = require('gulp-sourcemaps');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer')
var del = require('del');

var paths = {
  build_dir: './tmp',
  dest_dir: './public_html/js',
  dest_file: 'osweb.js',
  dependencies: [
    'src/js/dependencies/jquery.min.js',
    'src/js/dependencies/bootsrap.min.js',
    'src/js/dependencies/*.js',
  ],
  osweb_entrypoint: './src/js/osweb/main.js',
  styles:[
    'src/scss/*.scss',
    'src/scss/*.css'
  ]
};

gulp.task('js-osweb', function(){
    return browserify(paths.osweb_entrypoint,
        {standalone: 'osweb', debug: true})
        .bundle()
        .on('error', gutil.log.bind(gutil, 'Browserify Error'))
        .pipe(source('osweb.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true})) // loads map from browserify file
        //.pipe(uglify())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(paths.dest_dir));
});

gulp.task('js-interface', function() {
    return gulp
        .src(paths.dependencies)
        .pipe(sourcemaps.init())
          //.pipe(uglify())
            .pipe(concat('interface.js'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./public_html/js'));
});

gulp.task('css', function() {
    return gulp
        .src(paths.styles)
        .pipe(sass().on('error', sass.logError))
        .pipe(sourcemaps.init())
            .pipe(cleanCSS())
            .pipe(concat('osweb.css'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('public_html/css'));
});

gulp.task('js', ['js-interface','js-osweb']);

gulp.task('build', ['js','css']);

// Rerun the task when a file changes
gulp.task('watch', function() {
    gulp.watch(paths.osweb_modules, ['js-osweb']);
    gulp.watch(paths.dependencies, ['js-deps'])
    gulp.watch(paths.styles, ['css']);
});

gulp.task('default', ['css','js','watch']);
