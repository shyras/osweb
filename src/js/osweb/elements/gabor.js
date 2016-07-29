/*
 * Definition of the class gabor.
 */

(function() {
	function gabor(pSketchpad, pScript) {
		// Set the default properties.
		this.defaults = {};
		this.defaults.bgmode = 'avg';
		this.defaults.color1 = 'white';
		this.defaults.color2 = 'black';
		this.defaults.env = 'gaussian';
		this.defaults.freq = 1;
		this.defaults.orient = 0;
		this.defaults.phase = 0;
		this.defaults.size = 96;
		this.defaults.stdev = 12;
		this.defaults.x = null;
		this.defaults.y = null;

		// Inherited.
		this.base_element_constructor(pSketchpad, pScript, this.defaults);
	}

	// Extend the class from its base class.
	var p = osweb.extendClass(gabor, osweb.base_element);

	/*
	 * Definition of public methods (run cycle).   
	 */

	p.draw = function() {
		// Inherited.	
		this.base_element_draw();

                // Draw the gabor element to the canvas of the sketchpad.
		this.sketchpad.canvas.gabor(this._properties.x, this._properties.y, 
			this._properties.orient, this._properties.freq, this._properties.env,
			this._properties.size, this._properties.stdev, this._properties.phase, 
			this._properties.color1, this._properties.color2, this._properties.bgmode);
	};

	// Bind the gabor class to the osweb namespace.
	osweb.gabor = osweb.promoteClass(gabor, "base_element");
}());