/*
 * Definition of the class form_consent.
 */

module.exports = function(osweb){
    "use strict";
    function form_consent(pExperiment, pName, pScript) {
        // Inherited.
        this.form_base_constructor(pName, pExperiment, pScript, 'form_consent', 'A simple consent form');
    };

    // Extend the class from its base class.
    var p = osweb.extendClass(form_consent, osweb.form_base);

    // Define and set the public properties. 
    p.description = 'A simple consent form';

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

    // Bind the form_consent class to the osweb namespace.
    return osweb.promoteClass(form_consent, "form_base");
}