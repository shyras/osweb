
module.exports = function(osweb) {
    "use strict";
    // Definition of the class image.
    function image_button(pForm, pProperties) {
        // Inherited create.
        this.image_constructor(pForm, pProperties);

        // Set the class public properties.
        this.type = 'image_button';
        this.var = (typeof pProperties['var'] !== 'undefined') ? pProperties['var'] : null;

        // Add event listener to the element.
        this._image.addEventListener("click", this.response.bind(this));
    
        // Set the current status of the checkbox.
        this.set_var(false, this.var);  
    };

    // Extend the class from its base class.
    var p = osweb.extendClass(image_button, osweb.image);

    // Definition of public properties. 
    p.adjust = false;
    p.frame = false;
    p.path = null;

    // Definition of public methods 

    p.response = function(event) {
        // Remove event listener from the element.
        this._image.removeEventListener("click", this.response.bind(this));

        // Set the current status of the checkbox.
        this.set_var(true, this.var);  
    
        // Complete the item element.
        if (this.form.timeout === null) {
            this.form.item.complete();
        } 
        else {
            osweb.events._current_item._status = osweb.constants.STATUS_FINALIZE; 
        }    
    };

    // Bind the image class to the osweb namespace.
    return osweb.promoteClass(image_button, "image");
};