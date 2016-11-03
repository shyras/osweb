
module.exports = function(osweb){
    "use strict";
    // Definition of the class form_consent.
    function form_consent(pExperiment, pName, pScript) {
        // Inherited.
        this.form_base_constructor(pExperiment, pName, pScript, 'form_consent', 'A simple consent form');
    };

    // Extend the class from its base class.
    var p = osweb.extendClass(form_consent, osweb.form_base);

    // Define and set the public properties. 
    p.description = 'A simple consent form';
    p.decline_form = null;

    /*
     * Definition of public class methods - run cycle.
     */

    p.run = function() {
        // Inherited.	
        this.form_base_run();
    };

    p.complete = function() {
        // Check if the concense form is completed or the decline sub form.
        if (this.decline_form !== null) {
            // Hide the default form.
            this.decline_form._form.style.display = 'none';
            this.decline_form = null;
            
            // Re-run the consense form.
            this.run();
        }
        else {
            // Check if the consent status is shown.
            if (this.experiment.vars.get('accept_status') === true) {
                // Accept button is selected, check the checkbox status.
                if (this.experiment.vars.get('checkbox_status') === true) {
                    // Go to the next form, so continue the closure.
                    this.form_base_complete();
                }
                else { 
                    // Create the decline message form.
                    this.decline_form = new osweb.form(this.experiment, [1], [1], 10,['50','50','50','50'],'gray', this, 5000,false);
                
                    // Create the text widget.
                    var widget = osweb.newWidgetClass('label', this.decline_form, {'text': this.vars.decline_message,'center':'yes'});
    
                    // Add the widget to the form.
                    this.decline_form.set_widget(widget,[0,0],1,1);
                    
                    // Hide the default form.
                    this.form._form.style.display = 'none';
                    
                    // Execute the decline form.                
                    this.decline_form._exec(null);
                }
            }
            else {
                // Decline button pressed, stop the experiment.
                osweb.runner.exit();
            }   
        }    
    };

    // Bind the form_consent class to the osweb namespace.
    return osweb.promoteClass(form_consent, "form_base");
};