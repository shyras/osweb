/*
 * Definition of the class rect.
 */

(function() {
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

		// Draw the rectangle element to the canvas of the sketchpad.
		this.sketchpad.canvas.rect(this._properties.x, this._properties.y, this._properties.w, this._properties.h,
			this._properties.fill, this._properties.color, this._properties.penwidth);
	};

	// Bind the Rect class to the osweb namespace.
	osweb.rect = osweb.promoteClass(rect, "base_element");
}());