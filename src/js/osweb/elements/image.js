
/*
 * Definition of the class image.
 */

(function() 
{
    function image(pSketchpad, pScript)
    {
	// Set the class public properties.
	this.defaults	     = {};
	this.defaults.center = 1;
	this.defaults.file   = null;
	this.defaults.scale  = 1;
	this.defaults.x      = null;
	this.defaults.y      = null;

	// Set the class private properties. 
	this._file           = null;
		
	// Inherited.
	this.base_element_constructor(pSketchpad, pScript, this.defaults);
    } 
	
    // Extend the class from its base class.
    var p = osweb.extendClass(image, osweb.base_element);

    /*
     * Definition of public methods - run cycle.   
     */

    p.draw = function()
    {
        // Inherited.	
	this.base_element_draw();

    	// Retrieve the content from the file pool.
	this._file = osweb.pool[this._properties['file']];  

	// Draw the image element to the canvas of the sketchpad.
	this.sketchpad.canvas.image(this._file, this._properties.center, this._properties.x, this._properties.y, this._properties.scale);
    };
    
    // Bind the image class to the osweb namespace.
    osweb.image = osweb.promoteClass(image, "base_element");
}());
