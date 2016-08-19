/*
 * Definition of the class fixdot.
 */

(function() {
	function fixdot(pSketchpad, pScript) {
		// Set the default properties.
		this.defaults = {};
		this.defaults.color = pSketchpad.vars.get('foreground');
		this.defaults.style = 'default';
		this.defaults.x = null;
		this.defaults.y = null;

		// Inherited.
		this.base_element_constructor(pSketchpad, pScript, this.defaults);
	}

	// Extend the class from its base class.
	var p = osweb.extendClass(fixdot, osweb.base_element);

	/*
	 * Definition of public methods - running cycle.         
	 */

	p.draw = function() {
		// Inherited.	
		this.base_element_draw();

		// Create a styles object containing style information
		var styles = new osweb.Styles();
		styles.color = this._properties.color;

		// Draw the fixdot element to the canvas of the sketchpad.
		this.sketchpad.canvas.fixdot(this._properties.x, this._properties.y, 
			this._properties.style, styles);
	};

	// Bind the fixdot class to the osweb namespace.
	osweb.fixdot = osweb.promoteClass(fixdot, "base_element");
}());