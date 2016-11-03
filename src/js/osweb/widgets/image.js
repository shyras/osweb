
module.exports = function(osweb) {
    "use strict";
    // Definition of the class image.
    function image(pForm, pProperties) {
        // Inherited create.
        this.widget_constructor(pForm);

        // Set the class public properties.
        this.adjust = (typeof pProperties['adjust'] !== 'undefined') ? pProperties['adjust'] === 'yes' : false;
        this.frame = (typeof pProperties['frame'] !== 'undefined') ? pProperties['frame'] === 'yes' : false;
        this.path = (typeof pProperties['path'] !== 'undefined') ? pProperties['path'] : null;
        this.type = 'image';
    
        // Set the class private properties.
        this._image = document.createElement("img");
        this._image.style.position = 'absolute';
        
        // Add the image to the element.
        this._element.appendChild(this._image);
    };

    // Extend the class from its base class.
    var p = osweb.extendClass(image, osweb.widget);

    // Definition of public properties. 
    p.adjust = false;
    p.frame = false;
    p.path = null;

    // Definition of public methods 

    p.render = function() {
        // Draw the frame (if enabled).
        if (this.frame === true) {
            this.draw_frame();
        }
        
        // Retrieve the content from the file pool.
	var file = osweb.pool[this.path];
        
        // Set the image data
        this._image.src = file.data.src;
      
        // Position the element.
        var pwidth = this.convert_value(this._element.style.width);
        var pheight = this.convert_value(this._element.style.height);
        var width = this.convert_value(this._image.width);
        var height = this.convert_value(this._image.height);

        // Adjust size of enabled.
        if (this.adjust === false) {
            if (pheight < pwidth) {
                this._image.width = width * (pheight / height); 
                this._image.height = pheight;
                this._image.style.left = ((pwidth - (width * (pheight / height))) / 2) + 'px';
                this._image.style.top = 0 + 'px';
            }
            else {
                this._image.height = height * (pwidth / width); 
                this._image.width = pwidth;
                this._image.style.top = ((pheight - (height * (pwidth / width))) / 2) + 'px';
                this._image.style.left = 0 + 'px';
            }
        }
        else {
            this._image.style.left = ((pwidth - width) / 2) + 'px';
            this._image.style.top = ((pheight - height) / 2) + 'px';
        }
    };

    // Bind the image class to the osweb namespace.
    return osweb.promoteClass(image, "widget");
};