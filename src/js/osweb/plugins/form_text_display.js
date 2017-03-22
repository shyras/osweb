/**
 * Class representing a form text display item.
 * @extends FormBase
 */
import FormBase from './form_base.js';

export default class FormTextDisplay extends FormBase { 
    /**
     * Create a form which shows some simple text.
     * @param {Object} experiment - The experiment item to which the item belongs.
     * @param {String} name - The unique name of the item.
     * @param {String} script - The script containing the properties of the item.
     */
    constructor(experiment, name, script) {
		// Inherited.
		super(experiment, name, script, 'form_text_display', 'A simple text display form');
    }

    /** Implements the complete phase of an item. */
    _complete() {
        // Inherited.	
        super._complete();
    }

    /** Implements the run phase of an item. */
    run() {
        // Inherited.	
        super.run();
    }
}
 