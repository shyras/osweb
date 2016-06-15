del lib\*.* /q

type ..\system\osweb.js ..\system\constants.js >> lib\core.js
type ..\backends\canvas.js ..\backends\clock.js ..\backends\keyboard.js ..\backends\log.js ..\backends\mouse.js ..\backends\sampler.js ..\backends\video.js >> lib\backends.js
type ..\classes\debug.js ..\classes\file_pool_store.js ..\classes\functions.js ..\classes\heartbeat.js ..\classes\item_stack.js ..\classes\item_store.js ..\classes\prng.js ..\classes\python_workspace.js ..\classes\syntax.js ..\classes\var_store.js >> lib\classes.js
type ..\items\item.js ..\items\generic_response.js ..\items\experiment.js ..\items\inline_script.js ..\items\keyboard_response.js ..\items\logger.js ..\items\loop.js ..\items\mouse_response.js ..\items\sampler.js ..\items\sequence.js ..\items\sketchpad.js ..\items\feedback.js ..\items\synth.js >> lib\items.js 
type ..\plugins\advanced_delay.js ..\plugins\form_base.js ..\plugins\form_consent.js ..\plugins\form_multiple_choice.js ..\plugins\form_text_display.js ..\plugins\form_text_input.js ..\plugins\form_text_render.js ..\plugins\media_player_vlc.js ..\plugins\notepad.js ..\plugins\repeat_cycle.js ..\plugins\reset_feedback.js ..\plugins\touch_response.js >> lib\plugins.js
type ..\elements\base_element.js ..\elements\arrow.js ..\elements\circle.js ..\elements\ellipse.js ..\elements\fixdot.js ..\elements\gabor.js ..\elements\image.js ..\elements\line.js ..\elements\noise.js ..\elements\rect.js ..\elements\textline.js >> lib\elements.js
type ..\widgets\form.js ..\widgets\widget.js ..\widgets\button.js ..\widgets\checkbox.js ..\widgets\label.js >> lib\widgets.js
type ..\system\events.js ..\system\parameters.js ..\system\parser.js ..\system\session.js ..\system\runner.js >> lib\system.js
type lib\core.js lib\backends.js lib\classes.js lib\items.js lib\plugins.js lib\elements.js lib\widgets.js lib\system.js >> lib\osweb.js

copy lib\osweb.js ..\..\osweb.js