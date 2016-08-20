/*
 * Definition of the class form_multiple_choice.
 */

module.exports = function(osweb){
    function form_multiple_choice(pExperiment, pName, pScript) {
        // Inherited.
        this.item_constructor(pExperiment, pName, pScript);
    };

    // Extend the class from its base class.
    var p = osweb.extendClass(form_multiple_choice, osweb.item);

    // Define and set the public properties. 
    p.description = 'A simple multiple choice item';

    // Bind the form_base class to the osweb namespace.
    return osweb.promoteClass(form_multiple_choice, "item");
}