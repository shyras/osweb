
module.exports = function(osweb) {
    "use strict";
    // Definition of the class image_button.
    function image_button(pForm, pProperties) {
        // Inherited create.
        this.widget_constructor(pForm);

        // Set the class public properties.
        this.adjust = (typeof pProperties['adjust'] !== 'undefined') ? pProperties['adjust'] === 'true' : false;
        this.frame = (typeof pProperties['frame'] !== 'undefined') ? pProperties['frame'] === 'yes' : false;
        this.path = (typeof pProperties['path'] !== 'undefined') ? pProperties['path'] : null;
        this.type = 'image_button';
    
        // Set the class private properties.
        this._image = document.createElement("image");
    };

    // Extend the class from its base class.
    var p = osweb.extendClass(image_button, osweb.widget);

    // Definition of public properties. 
    p.adjust = false;
    p.frame = null;
    p.path = null;

    // Definition of public methods 

    p.render = function() {
        // Draw the frame (if enabled).
        if (this.frame === true) {
            this.draw_frame();
        }
        
        // Draw the image.

    };

    // Bind the image class to the osweb namespace.
    return osweb.promoteClass(image_button, "widget");
};