/*
 * Definition of the class ellipse.
 */

(function() {
	function ellipse(pSketchpad, pScript) {
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
	var p = osweb.extendClass(ellipse, osweb.base_element);

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

		// Draw the ellipse element to the canvas of the sketchpad.
		this.sketchpad.canvas.ellipse(Number(this._properties.x), 
			Number(this._properties.y), Number(this._properties.w), 
			Number(this._properties.h), styles);
	};

	// Bind the ellipse class to the osweb namespace.
	osweb.ellipse = osweb.promoteClass(ellipse, "base_element");
}());