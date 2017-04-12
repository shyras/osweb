import FormBase from './form_base.js';

/**
 * Class representing a form text display item.
 * @extends Item
 */
export default class FormTextInput extends FormBase { 
    /**
     * Create a form which shows some simple text.
     * @param {Object} pExperiment - The experiment item to which the item belongs.
     * @param {String} pName - The unique name of the item.
     * @param {String} pScript - The script containing the properties of the item.
     */
    constructor(experiment, name, script) {
		// Inherited.
		super(experiment, name, script, 'form_text_input' ,'A simple text input form');
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
 