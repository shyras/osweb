/*
 * Definition of the class rect.
 */

module.exports = function(osweb){
	"use strict";
	function rect(pSketchpad, pScript) {
		// Set the default properties.
		this.defaults = {};
		this.defaults.fill = 1;
		this.defaults.color = pSketchpad.vars.get('foreground');
		this.defaults.penwidth = 1;
		this.defaults.x = null;
		this.defaults.y = null;
		this.defaults.w = null;
		this.defaults.h = null;

		// Inherited.
		this.base_element_constructor(pSketchpad, pScript, this.defaults);
	}

	// Extend the class from its base class.
	var p = osweb.extendClass(rect, osweb.base_element);

	/*
	 * Definition of public methods - run cycle.   
	 */

	p.draw = function() {
		// Inherited.	
		this.base_element_draw();

		// Create a styles object containing style information
		var styles = new osweb.Styles();
		styles.fill = this._properties.fill;
		styles.color = this._properties.color;
		styles.penwidth = this._properties.penwidth;

		// Draw the rectangle element to the canvas of the sketchpad.
		this.sketchpad.canvas.rect(this._properties.x, this._properties.y, 
			this._properties.w, this._properties.h, styles);
	};

	// Bind the Rect class to the osweb namespace.
	return osweb.promoteClass(rect, "base_element");
}