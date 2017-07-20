import Sketchpad from './sketchpad.js';

/**
 * Class representing a feedback item.
 * @extends Sketchpad
 */
export default class Feedback extends Sketchpad {
    /**
     * Create a feedback which show feedback info to the subhect.
     * @param {Object} experiment - The experiment item to which the item belongs.
     * @param {String} name - The unique name of the item.
     * @param {String} script - The script containing the properties of the item.
     */
    constructor(experiment, name, script) {
        // Inherited create.
        super(experiment, name, script);
    
        // Definition of public properties. 
        this.description = 'Provides feedback to the participant';
    }

    /** Implements the complete phase of an item. */
    _complete() {
        // Inherited.	
        super._complete();

        // Reset feedback variables.
        if (this.vars.reset_variables === 'yes') {
            this.experiment.reset_feedback();
        }
    }

    /** Resets all item variables to their default value. */
    reset() {
        // Inherited.
        super.reset();
        
        // Reset the variables.
        this.vars.reset_variables = 'yes';
    }

    /** Implements the prepare phase of an item. */
    prepare() {
        this._parent._prepare_complete();
    }

    /** Implements the run phase of an item. */
    run() {
        // Inherited.	
        super.prepare();
        super.run();
    }
}
