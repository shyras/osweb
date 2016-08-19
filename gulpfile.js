/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var gulp = require('gulp');
var sass = require('gulp-sass');
var cleanCSS = require('gulp-clean-css');
var concat = require('gulp-concat');
var wrapJS = require("gulp-wrap-js");
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
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
  osweb_modules: [
    // System
    'src/js/osweb/system/osweb.js',
    'src/js/osweb/system/constants.js',
    // Backends
    'src/js/osweb/backends/canvas.js',
    'src/js/osweb/backends/clock.js',
    'src/js/osweb/backends/keyboard.js', 
    'src/js/osweb/backends/log.js',
    'src/js/osweb/backends/mouse.js', 
    'src/js/osweb/backends/sampler.js',
    'src/js/osweb/backends/video.js',
    // Classes
    'src/js/osweb/classes/debug.js',
    'src/js/osweb/classes/file_pool_store.js',
    'src/js/osweb/classes/heartbeat.js',
    'src/js/osweb/classes/item_stack.js',
    'src/js/osweb/classes/item_store.js',
    'src/js/osweb/classes/python_workspace.js',
    'src/js/osweb/classes/python_workspace_api.js',
    'src/js/osweb/classes/response_info.js',
    'src/js/osweb/classes/response_store.js',
    'src/js/osweb/classes/syntax.js',
    'src/js/osweb/classes/var_store.js',
    'src/js/osweb/classes/styles.js',
    // Items
    'src/js/osweb/items/item.js',
    'src/js/osweb/items/generic_response.js',
    'src/js/osweb/items/experiment.js', 
    'src/js/osweb/items/inline_script.js',
    'src/js/osweb/items/keyboard_response.js',
    'src/js/osweb/items/logger.js', 
    'src/js/osweb/items/loop.js',
    'src/js/osweb/items/mouse_response.js',
    'src/js/osweb/items/sampler.js',
    'src/js/osweb/items/sequence.js', 
    'src/js/osweb/items/sketchpad.js', 
    'src/js/osweb/items/feedback.js',
    'src/js/osweb/items/synth.js',
    // Plugins
    'src/js/osweb/plugins/advanced_delay.js',
    'src/js/osweb/plugins/form_base.js',
    'src/js/osweb/plugins/form_consent.js',
    'src/js/osweb/plugins/form_multiple_choice.js',
    'src/js/osweb/plugins/form_text_display.js',
    'src/js/osweb/plugins/form_text_input.js',
    'src/js/osweb/plugins/form_text_render.js',
    'src/js/osweb/plugins/media_player_vlc.js',
    'src/js/osweb/plugins/notepad.js',
    'src/js/osweb/plugins/repeat_cycle.js',
    'src/js/osweb/plugins/reset_feedback.js',
    'src/js/osweb/plugins/touch_response.js',
    // Elements
    'src/js/osweb/elements/base_element.js',
    'src/js/osweb/elements/arrow.js',
    'src/js/osweb/elements/circle.js',
    'src/js/osweb/elements/ellipse.js',
    'src/js/osweb/elements/fixdot.js',
    'src/js/osweb/elements/gabor.js',
    'src/js/osweb/elements/image.js',
    'src/js/osweb/elements/line.js',
    'src/js/osweb/elements/noise.js',
    'src/js/osweb/elements/rect.js',
    'src/js/osweb/elements/textline.js',
    // Widgets
    'src/js/osweb/widgets/form.js',
    'src/js/osweb/widgets/widget.js',
    'src/js/osweb/widgets/button.js',
    'src/js/osweb/widgets/checkbox.js',
    'src/js/osweb/widgets/label.js',
    // Remaining system module
    'src/js/osweb/system/events.js', 
    'src/js/osweb/system/functions.js', 
    'src/js/osweb/system/parameters.js',
    'src/js/osweb/system/parser.js',
    'src/js/osweb/system/prng.js',
    'src/js/osweb/system/screen.js',
    'src/js/osweb/system/session.js',
    'src/js/osweb/system/transfer.js',
    'src/js/osweb/system/runner.js',
  ],
  styles:[
    'src/scss/*.scss',
    'src/scss/*.css'
  ]
};

gulp.task('compose-osweb', function(){
    // Concatenate all osweb modules and wrap them as a commonjs module if not
    // run in a browser
    return gulp
        .src(paths.osweb_modules)
        .pipe(sourcemaps.init())
            .pipe(concat(paths.dest_file))
              //.pipe(uglify())
            
            // Create CommonJS module of the whole osweb (takes some time)
            .pipe(wrapJS("(function (root, mod) {"+
                "if (typeof exports == 'object' && typeof module == 'object') return mod(exports);" +
                "if (typeof define == 'function' && define.amd) return define(['exports'], mod);" +
                "osweb = mod.bind(root);"+
                "osweb(root.osweb || (root.osweb = {}));" +
                "})(this, function (osweb) { %= body %});"))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(paths.build_dir));
});

gulp.task('js-osweb', ['compose-osweb'], function(){
    return browserify(paths.build_dir + '/' + paths.dest_file)
        .bundle()
        .pipe(source('bundle.js'))
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
