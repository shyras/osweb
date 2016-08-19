/*
 * Definition of the class line.
 */

(function() {
	function line(pSketchpad, pScript) {
		// Set the default properties.
		this.defaults = {};
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
	var p = osweb.extendClass(line, osweb.base_element);

	/*
	 * Definition of public methods - run cycle.   
	 */

	p.draw = function() {
		// Inherited.	
		this.base_element_draw();

		// Create a styles object containing style information
		var styles = new osweb.Styles();
		styles.color = this._properties.color;
		styles.penwidth = this._properties.penwidth;

		// Draw the line element to the canvas of the sketchpad.
		this.sketchpad.canvas.line(this._properties.x1, this._properties.y1, 
			this._properties.x2, this._properties.y2, styles);
	};

	// Bind the line class to the osweb namespace.
	osweb.line = osweb.promoteClass(line, "base_element");
}());