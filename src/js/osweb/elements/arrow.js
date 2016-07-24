/*
 * Definition of the class arrow.
 */

(function() {
	function arrow(pSketchpad, pScript) {
		// Set the default properties.
		this.defaults = {};
		this.defaults.arrow_body_length = 0.8;
		this.defaults.arrow_body_width = 0.5;
		this.defaults.arrow_head_width = 30;
		this.defaults.fill = 1;
		this.defaults.color = pSketchpad.vars.get('foreground');
		this.defaults.penwidth = 1;
		this.defaults.x1 = null;
		this.defaults.y1 = null;
		this.defaults.x2 = null;
		this.defaults.y2 = null;

		// Inherited.
		this.base_element_constructor(pSketchpad, pScript, this.defaults);
	}

	// Extend the class from its base class.
	var p = osweb.extendClass(arrow, osweb.base_element);

	/*
	 * Definition of public methods - run cycle.   
	 */

	p.draw = function() {
		// Inherited.	
		this.base_element_draw();

		// Draw the arrow element to the canvas of the sketchpad.
		this.sketchpad.canvas.arrow(this._properties.x1, this._properties.y1, this._properties.x2, this._properties.y2, this._properties.arrow_body_width, this._properties.arrow_body_length, 
                                            this._properties.arrow_head_width, this._properties.fill, this._properties.color, this._properties.penwidth);
	};

	// Bind the Arrow class to the osweb namespace.
	osweb.arrow = osweb.promoteClass(arrow, "base_element");
}());