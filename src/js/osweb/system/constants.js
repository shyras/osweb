// Control elements
import Loop from '../items/loop.js';
import Sequence from '../items/sequence.js';
// Slides
import Sketchpad from '../items/sketchpad.js';
import Feedback from '../items/feedback.js';
// Scripts
import InlineScript from '../items/inline_script.js';
// Responses
import KeyboardResponse from '../items/keyboard_response.js';
import MouseResponse from '../items/mouse_response';
import Logger from '../items/logger.js';
// Audio
import Sampler from '../items/sampler.js';
import Synth from '../items/synth.js';

// Elements
import Arrow from '../elements/arrow.js';
import Circle from '../elements/circle.js';
import Ellipse from '../elements/ellipse.js';
import Fixdot from '../elements/fixdot.js';
import Gabor from '../elements/gabor.js';
import ImageElement from '../elements/image.js'; // Image is a reserved JS class 
import Line from '../elements/line.js';
import Noise from '../elements/noise.js';
import Rect from '../elements/rect.js';
import TextLine from '../elements/textline.js';

// Widgets
import ButtonWidget from '../widgets/button.js';
import CheckBoxWidget from '../widgets/checkbox.js';
import FormWidget from '../widgets/form.js';
import ImageWidget from '../widgets/image_widget.js';
import ImageButtonWidget from '../widgets/image_button.js';
import LabelWidget from '../widgets/label.js';
import RatingScaleWidget from '../widgets/rating_scale.js';
import TextInputWidget from '../widgets/text_input.js';
import Themes from '../widgets/themes.js'; 

// Plugins
import AdvancedDelay from '../plugins/advanced_delay.js';
import FormBase from '../plugins/form_base.js';
import FormConsent from '../plugins/form_consent.js';
import FormMultipleChoice from '../plugins/form_multiple_choice.js';
import FormTextDisplay from '../plugins/form_text_display.js';
import FormTextInput from '../plugins/form_text_input.js';
import MediaPlayer from '../plugins/media_player.js';
import Notepad from '../plugins/notepad.js';
import RepeatCycle from '../plugins/repeat_cycle.js';
import ResetFeedback from '../plugins/reset_feedback.js';
import TouchResponse from '../plugins/touch_response.js';

/**
 * this variable maps the string representation of each element to the corresponding
 * class names.
 * @type {Object}
 */
export const itemClasses = {
    // Items
    loop: Loop,
    sequence: Sequence,
    sketchpad: Sketchpad,
    feedback: Feedback,
    inline_script: InlineScript,
    keyboard_response: KeyboardResponse,
    mouse_response: MouseResponse,
    logger: Logger,
    sampler: Sampler,
    synth: Synth,
    // Elements
    arrow: Arrow,
    circle: Circle,
    ellipse: Ellipse,
    fixdot: Fixdot,
    gabor: Gabor,
    image: ImageElement,
    line: Line,
    noise: Noise,
    rect: Rect,
    textline: TextLine,
    // Widgets
    button_widget: ButtonWidget,
    checkbox_widget: CheckBoxWidget,
    form_widget: FormWidget,
    image_button_widget: ImageButtonWidget,
    image_widget: ImageWidget,
    label_widget: LabelWidget,
    rating_scale_widget: RatingScaleWidget,
    text_input_widget: TextInputWidget,
    themes: Themes,
    // Plugins
    advanced_delay: AdvancedDelay,
    form_base: FormBase,
    form_consent: FormConsent,
    form_multiple_choice: FormMultipleChoice,
    form_text_display: FormTextDisplay,
    form_text_input: FormTextInput,
    media_player_mpy: MediaPlayer,
    notepad: Notepad,
    repeat_cycle: RepeatCycle,
    reset_feedback: ResetFeedback,
    touch_response: TouchResponse,    
}

export const constants = {
    // Type of used collection mode.           
    PRESSES_ONLY: 1,
    RELEASES_ONLY: 2,
    PRESSES_AND_RELEASES: 3,
        
    // Type of response used.
    RESPONSE_NONE: 0, 
    RESPONSE_DURATION: 1,
    RESPONSE_KEYBOARD: 2,
    RESPONSE_MOUSE: 3,
    RESPONSE_SOUND: 4,
    RESPONSE_AUTOKEYBOARD: 5,
    RESPONSE_AUTOMOUSE: 6,
 
    // Running status of an item.   
    STATUS_NONE: 0, 
    STATUS_BUILD: 1,
    STATUS_INITIALIZE: 2,
    STATUS_EXECUTE: 3,
    STATUS_FINALIZE: 4,
    
    // Definition of the event loop status contstants.
    TIMER_NONE: 0,
    TIMER_WAIT: 1,
    TIMER_EXIT: 2,
    TIMER_PAUSE: 3,
    TIMER_RESUME: 4,
    TIMER_DONE: 5,
    TIMER_BREAK: 6,
    TIMER_ERROR: 7,
    TIMER_FORM: 8
}
