/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var gulp = require('gulp');
var concat = require('gulp-concat');

function handleErrors() {
  var args = Array.prototype.slice.call(arguments);
  notify.onError({
    title: "Compile Error",
    message: "<%= error.message %>"
  }).apply(this, args);
  this.emit('end'); // Keep gulp from hanging on this task
}

gulp.task('default', function() {
  return gulp
    .src(['src/js/osweb/system/header.js',
          'src/js/osweb/system/constants.js',
          'src/js/osweb/backends/canvas.js',
          'src/js/osweb/backends/clock.js',
          'src/js/osweb/backends/keyboard.js',
          'src/js/osweb/backends/log.js',
          'src/js/osweb/backends/mouse.js',
          'src/js/osweb/backends/sampler.js',
          'src/js/osweb/backends/styles.js',
          'src/js/osweb/classes/file_pool_store.js',
          'src/js/osweb/classes/item_stack.js',
          'src/js/osweb/classes/item_store.js',
          'src/js/osweb/classes/python_workspace.js',
          'src/js/osweb/classes/response_info.js',
          'src/js/osweb/classes/response_store.js',
          'src/js/osweb/classes/syntax.js',
          'src/js/osweb/classes/var_store.js',
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
          'src/js/osweb/items/item.js',
          'src/js/osweb/items/experiment.js',
          'src/js/osweb/items/generic_response.js',
          'src/js/osweb/items/keyboard_response.js',
          'src/js/osweb/items/mouse_response.js',
          'src/js/osweb/items/inline_script.js',
          'src/js/osweb/items/logger.js',
          'src/js/osweb/items/loop.js',
          'src/js/osweb/items/sampler.js',
          'src/js/osweb/items/sequence.js',
          'src/js/osweb/items/sketchpad.js',
          'src/js/osweb/items/feedback.js',
          'src/js/osweb/items/synth.js',
          'src/js/osweb/plugins/advanced_delay.js',
          'src/js/osweb/plugins/notepad.js',
          'src/js/osweb/plugins/repeat_cycle.js',
          'src/js/osweb/plugins/reset_feedback.js',
          'src/js/osweb/plugins/touch_response.js',
          'src/js/osweb/python/python.js',
          'src/js/osweb/python/python_math.js',
          'src/js/osweb/python/python_opensesame.js',
          'src/js/osweb/python/python_random.js',
          'src/js/osweb/python/python_string.js',
          'src/js/osweb/system/debugger.js',
          'src/js/osweb/system/events.js',
          'src/js/osweb/system/parameters.js',
          'src/js/osweb/system/screen.js',
          'src/js/osweb/system/session.js',
          'src/js/osweb/system/transfer.js',
          'src/js/osweb/system/runner.js',
          'src/js/osweb/system/footer.js'])
    .pipe(concat('osweb.js'))
    .pipe(gulp.dest('./public_html/js'));     
});   