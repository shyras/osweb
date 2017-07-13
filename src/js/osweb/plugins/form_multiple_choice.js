import FormBase from './form_base.js';

/**
 * Class representing a form with multiple choise item.
 * @extends FormBase
 */
export default class FormMultipleChoice extends FormBase { 
    /**
     * Create a form which shows some simple text.
     * @param {Object} experiment - The experiment item to which the item belongs.
     * @param {String} name - The unique name of the item.
     * @param {String} script - The script containing the properties of the item.
     */
    constructor(experiment, name, script) {
  	    // Inherited.
        super(experiment, name, script, 'form_multiple_choice' ,'A simple multiple choise item');
    }

    /** Implements the complete phase of an item. */
    _complete() {
        // Inherited.	
        super._complete();
    }

    /** Implements the run phase of an item. */
    prepare() {
        //  
        this.vars.cols = '1;1;';
        this.vars.rows = '1;1;';
        this._widgets = [];

        this._widgets.push(this.syntax.split('0 0 2 1 label text="[form_title]"'));
        this._widgets.push(this.syntax.split('0 1 2 1 label center=no text="[question]"'));
        // Add the individual labels.
        for (var i = 0;i < this.options.length; i++) {
            this._widgets.push(this.syntax.split('0 ' + String(i + 2) + ' 2 1 checkbox group=group1 center=no text="' + this.options[i] + '"'));
            this.vars.rows = this.vars.rows + '1;'    
        }    
        this._widgets.push(this.syntax.split('0 ' + String(i + 3) + ' 2 2 button text="[button_text]"'));
        this.vars.rows = this.vars.rows + '1;1;'    

        // Inherited prepare.
        super.prepare();
    }

    /** Implements the run phase of an item. */
    run() {
        // Inherited.	
        super.run();
    }
}