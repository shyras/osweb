
module.exports = function(osweb){
    "use strict";
    // Definition of the class form_text_input.
    function form_text_input(pExperiment, pName, pScript) {
        // Inherited.
        this.form_base_constructor(pExperiment, pName, pScript, 'form_text_input' ,'A simple text input form');
    };

    // Extend the class from its base class.
    var p = osweb.extendClass(form_text_input, osweb.form_base);

    // Define and set the public properties. 
    p.description = 'A simple text input form';
    
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


    // Bind the form_base class to the osweb namespace.
    return osweb.promoteClass(form_text_input, "form_base");
};