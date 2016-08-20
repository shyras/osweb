/*
 * Definition of the class form_text_input.
 */

module.exports = function(osweb){
    function form_text_input(pExperiment, pName, pScript) {
        // Inherited.
        this.form_base_constructor(pExperiment, pName, pScript);
    };

    // Extend the class from its base class.
    var p = osweb.extendClass(form_text_input, osweb.form_base);

    // Define and set the public properties. 
    p.description = 'A simple text input form';

    // Bind the form_base class to the osweb namespace.
    return osweb.promoteClass(form_text_input, "form_base");
}