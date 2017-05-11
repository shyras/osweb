import GenericResponse from './generic_response.js';
import Mouse from '../backends/mouse.js';

/**
 * Class representing a mouse response item.
 * @extends GenericResponse
 */
export default class MouseResponse extends GenericResponse {
    /**
     * Create an mouse response item which waits for a mouse response.
     * @param {Object} experiment - The experiment item to which the item belongs.
     * @param {String} name - The unique name of the item.
     * @param {String} script - The script containing the properties of the item.
     */
    constructor(experiment, name, script) {
		// Inherited.
		super(experiment, name, script);

        // Definition of public properties. 
        this.description = 'Collects mouse responses';
        this.resp_codes = {};

        // Definition of private properties. 
        this._flush = 'yes';
        this._mouse = new Mouse(this.experiment);
    
        // Process the script.
        this.from_string(script);
    }

    /** Implements the complete phase of the Sketschpad. */
    _complete() {
        // Hide the mouse cursor.    
        this._mouse.show_cursor(false);

        // Inherited.	
        super._complete();
    }

    /** Resets all item variables to their default value. */
    reset() {
        this.auto_response = 1;
        this.process_feedback = true;
        this.resp_codes = {};
        this.resp_codes['0'] = 'timeout';
        this.resp_codes['1'] = 'left_button';
        this.resp_codes['2'] = 'middle_button';
        this.resp_codes['3'] = 'right_button';
        this.resp_codes['4'] = 'scroll_up';
        this.resp_codes['5'] = 'scroll_down';
        this.vars.allowed_responses = null;
        this.vars.correct_response = null;
        this.vars.duration = 'mouseclick';
        this.vars.flush = 'yes';
        this.vars.show_cursor = 'yes';
        this.vars.timeout = 'infinite';
    }

    /** Implements the prepare phase of the Sketschpad. */
    prepare() {
        // Set the internal flush property.
        this._flush = (this.vars.flush) ? this.vars.flush : 'yes';

        // Inherited.	
        super.prepare();
    }

    /** Implements the run phase of the Sketschpad. */
    run() {
        // Inherited.	
        super.run();

        // Record the onset of the current item.
        this.set_item_onset();

        // Show the cursor if defined.
        if (this.vars.show_cursor === 'yes') {
            this._mouse.show_cursor(true);
        }

        // Flush responses, to make sure that earlier responses are not carried over.
        if (this._flush === 'yes') {
            this._mouse.flush();
        }

        this.set_sri();
        this.process_response();
    }
}
