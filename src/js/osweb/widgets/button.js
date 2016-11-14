
module.exports = function(osweb){
    "use strict";
    // Definition of the class button.
    function button(pForm, pProperties) {
        // Inherited create.
        this.label_constructor(pForm, pProperties);
    
        // Set the class public properties.
        this.type = 'button';
        this.var = (typeof pProperties['var'] !== 'undefined') ? pProperties['var'] : this.var;

        // Add event listener to the element.
        this._label_cell.addEventListener("click", this.response.bind(this));
    
        // Set the current status of the checkbox.
        this.set_var(false, this.var);  
    };

    // Extend the class from its base class.
    var p = osweb.extendClass(button, osweb.label);

    // Definition of public properties. 
    p.frame = true;
    p.var = null;

    /*
     * Definition of public class methods - build cycle.
     */

    p.response = function(event) {
        // Remove event listener from the element.
        this._label_cell.removeEventListener("click", this.response.bind(this));

        // Set the attached variable.
        this.set_var(true, this.var);  

        // Complete the item element.
        if (this.form.timeout === null) {
            this.form.item.complete();
        } 
        else {
            osweb.events._current_item._status = osweb.constants.STATUS_FINALIZE; 
        }    
    };

    // Bind the button class to the osweb namespace.
    return osweb.promoteClass(button, "label");
};