
/**
 * Class representing a form text display item.
 * @extends Item
 */
import FormBase from './form_base.js';

export default class FormTextInput extends FormBase { 
    /**
     * Create a form which shows some simple text.
     * @param {Object} pExperiment - The experiment item to which the item belongs.
     * @param {String} pName - The unique name of the item.
     * @param {String} pScript - The script containing the properties of the item.
     */
    constructor(pExperiment, pName, pScript) {
		// Inherited.
		super(pExperiment, pName, pScript, 'form_text_input' ,'A simple text input form');
    }

    run() {
        // Inherited.	
        super.run();
    }

    complete() {
        // Inherited.	
        super.complete();
    }
}