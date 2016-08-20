/*
 * Definition of the class form_text_display.
 */

module.exports = function(osweb){
    function form_text_display(pExperiment, pName, pScript) {
        // Inherited.
        this.form_base_constructor(pName, pExperiment, pScript, 'form_text_display', 'A simple text display form');
    };

    // Extend the class from its base class.
    var p = osweb.extendClass(form_text_display, osweb.form_base);

    // Define and set the public properties. 
    p.description = 'A simple text display form';

    /*
     * Definition of public class methods - run cycle.
     */

    p.run = function() {
        // Inherited.	
        this.form_base_run();
    };

    p.complete = function() {
        // Inherited.	
        this.form_base_complete();
    };

    // Bind the form_text_display class to the osweb namespace.
    return osweb.promoteClass(form_text_display, "form_base");
}