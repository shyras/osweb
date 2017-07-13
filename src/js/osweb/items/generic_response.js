import Item from './item.js';
import Keyboard from '../backends/keyboard.js';
import Mouse from '../backends/mouse.js';
import { constants } from '../system/constants.js';

/**
 * Class representing a GeneralResponse item. 
 * @extends Item
 */
export default class GenericResponse extends Item {
    /** The sequence class controls the running of a serie of items. */
    constructor(experiment, name, script) {
        // Inherited.
        super(experiment, name, script)     

        // Create and set private properties. 
        this._allowed_responses = null;
        this._duration = 0;
        this._duration_func = null;
        this._keyboard = null;
        this._mouse = null;
        this._responsetype = constants.RESPONSE_NONE;
        this._timeout = -1;

        // Create and set public properties. 
        this.auto_response = "a";
        this.process_feedback = false;
        this.synonyms = null;
    }   

    /** Implements the complete phase of the general response item. */
    _complete() {
        // Check if a timeout has occured which must be treaded as a response.
        if ((typeof this.vars.timeout !== 'undefined') && ((this.experiment._runner._events._timeStamp - this.experiment.vars.get('time_' + this.name)) > this.vars.timeout)) { 
            // Process the timeout none response. 
            this.process_response_timeout();
        }

        // Inherited.	
        super._complete();
    }

    /** 
     * Implements the update response phase of the general response item.
     * @param {Object} response - The response object which is evaluated.
     */
    _update(response) {
        if (response !== null) {
            // Implements the update response phase of the item.
            if ((this._responsetype === constants.RESPONSE_KEYBOARD) && (response.type === constants.RESPONSE_KEYBOARD)) {
                this.process_response_keypress(response);
            } else if ((this._responsetype == constants.RESPONSE_MOUSE) && (response.type == constants.RESPONSE_MOUSE)) {
                this.process_response_mouseclick(response);
            }
        }
    }

    /** The auto responder method for simulated keyboard interaction. */
    auto_responser() {
    }

    /** The auto responder method for simulated mouse interaction. */
    auto_responser_mouse() {
    }

    /** Prepare the list with allowed responses */
    prepare_allowed_responses() {
        // Prepare the allowed responses.
        if (this.vars.get('allowed_responses') === null) {
            this._allowed_responses = null;
        } else {
            // Create a list of allowed responses that are separated by semicolons. Also trim any whitespace.
            var allowed_responses = String(this.vars.allowed_responses).split(';');
            if (this.vars.duration === 'keypress') {
                //this._allowed_responses = allowed_responses;
                this._allowed_responses = this._keyboard._get_default_from_synoniem(allowed_responses);
            } else if (this.vars.duration === 'mouseclick') {
                // For mouse responses, we don't check if the allowed responses make sense.
                this._allowed_responses = this._mouse._get_default_from_synoniem(allowed_responses);
            }
   
            // If allowed responses are provided, the list should not be empty.
            if (this._allowed_responses.length === 0) {
                this.experiment._runner._debugger.addError('Defined responses are not valid in keyboard_response: ' + this.name + ' (' + this.vars.get('allowed_responses') + ')');
            }
        }
    }

    // Prepare the duration of the stimulus interaction. */
    prepare_duration() {
        // Get duration. 
        this._duration = this.syntax.remove_quotes(this.vars.get('duration'));

        // Prepare the duration.
        if (this._duration !== null) {
            if ((this._duration == 'keypress') || (this._duration == 'mouseclick') || 
                (this._duration == 'sound') || (this._duration === 'video')) {   
                this._duration = -1;
                if (this.vars.duration === 'keypress') {
                    this.prepare_duration_keypress();
                    this._responsetype = constants.RESPONSE_KEYBOARD;
                } else if (this.vars.duration === 'mouseclick') {
                    this.prepare_duration_mouseclick();
                    this._responsetype = constants.RESPONSE_MOUSE;
                } else if (this.vars.duration === 'sound') {
                    this._responsetype = constants.RESPONSE_SOUND;
                } else if (this.vars.duration === 'video') {
                    this._responsetype = constants.RESPONSE_VIDEO;
                }
            } else {   
                // Prepare a duration in milliseconds
                this._duration = Number(this._duration);
                if (this._duration === 0) {
                    this._responsetype = constants.RESPONSE_NONE;
                } else {
                    this._responsetype = constants.RESPONSE_DURATION;
                }
            } 
        }
    }

    /** Prepare the system for a keyboard duration interval. */
    prepare_duration_keypress() {
        // Prepare a keyboard duration.
        this._keyboard = new Keyboard(this.experiment);
        if (this.experiment.auto_response === true) {
            this._duration_func = this.auto_responder;
        } else {
            var final_duration = (this._timeout !== -1) ? this._timeout : this._duration;
            this._keyboard._set_config(final_duration, this._allowed_responses);
        }
    }

    /** Prepare the system for a mouseclick duration interval. */
    prepare_duration_mouseclick(self) {
        // Prepare a mouseclick duration.
        this._mouse = new Mouse(this.experiment);
        if (this.experiment.auto_response === true) {
            this._duration_func = this.auto_responder_mouse;
        } else {
            var final_duration = (this._timeout !== -1) ? this._timeout : this._duration;
            this._mouse._set_config(final_duration, this._allowed_responses, false);
        }
    }

    /** Prepare the system for a timeout. */
    prepare_timeout() {
        // Prepare the timeout.
        if (this.vars.get('timeout') !== null) {
            if (typeof this.vars.timeout === 'number') {
                // Prepare a duration in milliseconds
                this._timeout = this.vars.timeout;
            } else {
                this._timeout = -1;
            }
        }
    }

    /** Select the type of stimulus response processing. */
    process_response() {
        // Start stimulus response cycle.
        switch (this._responsetype) {
            case constants.RESPONSE_NONE:
                // Duration is 0, so complete the stimulus/response cycle.
                this._status = constants.STATUS_FINALIZE;
                this._complete();
            break;
            case constants.RESPONSE_DURATION:
                this.sleep_for_duration();
            break;
            case constants.RESPONSE_KEYBOARD:
                this._keyboard.get_key();
            break;
            case constants.RESPONSE_MOUSE:
                this._mouse.get_click();
            break;
            case constants.RESPONSE_SOUND:
                this._sampler.wait();
            break;
            case constants.RESPONSE_VIDEO:
                this._video_player.wait();
            break;
        }
    }

    /** Process a keyboard response. */
    process_response_keypress(retval) {
        this.experiment._start_response_interval = this.sri;
        this.experiment._end_response_interval = retval.rtTime;
        this.experiment.vars.response = this.syntax.sanitize(retval.resp);
        this.synonyms = this._keyboard._synonyms(this.experiment.vars.response);
        this.response_bookkeeping();
    }

    /** Process a mouse click response. */
    process_response_mouseclick(retval) {
        this.experiment._start_response_interval = this.sri;
        this.experiment._end_response_interval = retval.rtTime;
        this.experiment.vars.response = retval.resp;
        this.synonyms = this._mouse._synonyms(this.experiment.vars.response);
        this.experiment.vars.cursor_x = retval.event.clientX;
        this.experiment.vars.cursor_y = retval.event.clientY;
        this.response_bookkeeping();
    }

    /** Process a time out response. */
    process_response_timeout() {
        this.experiment._start_response_interval = this.sri;
        this.experiment._end_response_interval = this.experiment._runner._events._timeStamp;
        this.experiment.vars.response = 'None';
        this.synonyms = ['None','none'];
        this.response_bookkeeping();
    }

    /** General response logging after a stimulus/response. */
    response_bookkeeping() {
        // The respone and response_time variables are always set, for every response item
        this.experiment.vars.set('response_time', this.experiment._end_response_interval - this.experiment._start_response_interval);
        this.experiment.vars.set('response_' + this.name, this.experiment.vars.get('response'));
        this.experiment.vars.set('response_time_' + this.name, this.experiment.vars.get('response_time'));
        this.experiment._start_response_interval = null;

        // But correctness information is only set for dedicated response items, 
        // such as keyboard_response items, because otherwise we might confound the feedback
        if (this.process_feedback === true) {
            if (this.vars.get('correct_response') !== null) {
                // If a correct_response has been defined, we use it to determine accuracy etc.
                if (this.synonyms !== null) {
                    if (this.synonyms.includes(this.syntax.remove_quotes(this.vars.get('correct_response')))) {
                        this.experiment.vars.correct = 1;
                        this.experiment.vars.total_correct = this.experiment.vars.total_correct + 1;
                    } else {
                        this.experiment.vars.correct = 0;
                    }
                } else {
                    this.experiment.vars.correct = 'undefined';
                    /* if self.experiment.response in (correct_response, safe_decode(correct_response)):
                    	self.experiment.var.correct = 1
    		self.experiment.var.total_correct += 1
                    else:
                    	self.experiment.var.correct = 0 */
                }
            } else {
                // If a correct_response hasn't been defined, we simply set correct to undefined.
                this.experiment.vars.correct = 'undefined';
            }

            // Do some response bookkeeping
            this.experiment.vars.total_response_time = this.experiment.vars.total_response_time + this.experiment.vars.response_time;
            this.experiment.vars.total_responses = this.experiment.vars.total_responses + 1;
            this.experiment.vars.accuracy = Math.round(100.0 * this.experiment.vars.total_correct / this.experiment.vars.total_responses);
            this.experiment.vars.acc = this.experiment.vars.accuracy;
            this.experiment.vars.average_response_time = Math.round(this.experiment.vars.total_response_time / this.experiment.vars.total_responses);
            this.experiment.vars.avg_rt = this.experiment.vars.average_response_time;
            this.experiment.vars.set('correct_' + this.name, this.vars.correct);
        }
    }

    /**
     * Sets or resets the start of the stimulus response interval.
     * @param {Boolean} reset - If true reset the sri value.
     */
    set_sri(reset) {
        // Sets the start of the response interval.
        if (reset === true) {
            this.sri = self.vars.get('time_' + this.name);
            this.experiment._start_response_interval = this.vars.get('time_' + this.name);
        }
        if (this.experiment._start_response_interval === null) {
            this.sri = this.experiment.vars.get('time_' + this.name);
        } else {
            this.sri = this.experiment._start_response_interval;
        }
    }

    /** Sleep for a specified time. */
    sleep_for_duration() {
        // Sleep for a specified time.
        this.sleep(this._duration);
    }

    /** Implements the prepare phase of the general response item. */
    prepare() {
        // Implements the prepare phase of the item.
        this.prepare_timeout();
        this.prepare_allowed_responses();
        this.prepare_duration();

        // Inherited.	
        super.prepare();
    }
}
 