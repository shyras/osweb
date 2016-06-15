
/*
 * Definition of the class circle.
 */

(function() 
{
    function circle(pSketchpad, pScript)
    {
	// Set the default properties.
	this.defaults          = {};
	this.defaults.color    = pSketchpad.vars.get('foreground');
	this.defaults.fill     = 0;
	this.defaults.penwidth = 1;
	this.defaults.x        = null;
	this.defaults.y        = null;
	this.defaults.r        = null;
		
	// Inherited.
	this.base_element_constructor(pSketchpad, pScript, this.defaults);
    } 
	
    // Extend the class from its base class.
    var p = osweb.extendClass(circle, osweb.base_element);

    /*
     * Definition of public methods - run cycle.   
     */
	
    p.draw = function()
    {
        // Inherited.	
	this.base_element_draw();
		
	// Draw the circle element to the canvas of the sketchpad.
	this.sketchpad.canvas.circle(this._properties.x, this._properties.y, this._properties.r, this._properties.fill, this._properties.color, this._properties.penwidth);
    };
    
    // Bind the Circle class to the osweb namespace.
    osweb.circle = osweb.promoteClass(circle,"base_element");
}());
