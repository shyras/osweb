
/*
 * Definition of the class textline.
 */

(function() 
{
    function textline(pSketchpad, pScript)
    {
        // Set the default properties.
	this.defaults             = {};
	this.defaults.center      = 1;
	this.defaults.color       = pSketchpad.vars.get('foreground');
	this.defaults.font_family = pSketchpad.vars.get('font_family');
	this.defaults.font_size   = pSketchpad.vars.get('font_size');
	this.defaults.font_bold   = pSketchpad.vars.get('font_bold');
	this.defaults.font_italic = pSketchpad.vars.get('font_italic');
	this.defaults.html        = 'yes';
	this.defaults.text        = null;
	this.defaults.x           = null;
	this.defaults.y           = null;

	// Inherited.
	this.base_element_constructor(pSketchpad, pScript, this.defaults);
    } 
	
    // Extend the class from its base class.
    var p = osweb.extendClass(textline, osweb.base_element);
	
    /*
     * Definition of public methods - running cycle.         
     */

    p.draw = function()
    {
        // Inherited.	
    	this.base_element_draw();
		
    	// Set the font style and draw the text element to the canvas of the sketchpad.
	this.sketchpad.canvas.set_font(this._properties.font_family, this._properties.font_size, this._properties.font_italic == 'yes', this._properties.font_bold == 'yes', this._properties.font_underline == 'yes');		
        this.sketchpad.canvas.text(this._properties.text, this._properties.center, this._properties.x, this._properties.y, this._properties.color, this._properties.html);
    };
    
    // Bind the Text class to the osweb namespace.
    osweb.textline = osweb.promoteClass(textline, "base_element");
}());
