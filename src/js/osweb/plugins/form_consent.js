import FormBase from './form_base.js';
import FormWidget from '../widgets/form.js';

/**
 * Class representing a consent form.
 * @extends FormBase
 */
export default class FormConsent extends FormBase { 
    /**
     * Create a form which shows some simple text.
     * @param {Object} experiment - The experiment item to which the item belongs.
     * @param {String} name - The unique name of the item.
     * @param {String} script - The script containing the properties of the item.
     */
    constructor(experiment, name, script) {
		// Inherited.
		super(experiment, name, script, 'form_consent', 'A simple consent form');

        // Define and set the public properties. 
        this.decline_form = null;
    }

    /** Implements the complete phase of an item. */
    _complete() {
         // Check if the concense form is completed or the decline sub form.
        if (this.decline_form !== null) {
            // Hide the default form.
            this.decline_form._canvas._container.visible = false;
            this.form._canvas._container.visible = true;
            this.decline_form = null;
            
            // Re-run the consense form.
            this.run();
        }
        else {
            // Check if the consent status is shown.
            if (this.experiment.vars.get('accept_status') === true) {
                // Accept button is selected, check the checkbox status.
                if (this.experiment.syntax.remove_quotes(this.experiment.vars.get('checkbox_status')) === this.vars.get('checkbox_text')) {
                    // Go to the next form, so continue the closure.
                    super._complete();
                }
                else { 
                    console.log('decline form');
                    // Create the decline message form.
                    this.decline_form = new FormWidget(this.experiment, [1], [1], 10, ['50','50','50','50'], 'gray', this, 5000, false);
                
                    // Create the text widget.
                    var widget = this.experiment.items._newWidgetClass('label', this.decline_form, {text: this.vars.decline_message, center: 'yes'});
                   
                    // Add the widget to the parent form.                    
                    this.decline_form.set_widget(widget, [0,0], 1, 1);

                    // Hide the default form.
                    this.form._canvas._container.visible = false;
                    this.decline_form._canvas._container.visible = true;

                    // Execute the decline form.                
                    this.decline_form._exec(null); 
                }
            }
            else {
                // Decline button pressed, stop the experiment.
                this.experiment._runner.exit();
            }   
        }    
    }

    /** Implements the run phase of an item. */
    run() {
        // Inherited.	
        super.run();
    }
}
 