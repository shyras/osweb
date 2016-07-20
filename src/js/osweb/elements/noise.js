/*
 * Definition of the class noise.
 */

(function() {
    function noise(pSketchpad, pScript) {
        // Set the default properties.
        this.defaults = {};
        this.defaults.color1 = 'white';
        this.defaults.color2 = 'black';
        this.defaults.env = 'gaussian';
        this.defaults.size = 96;
        this.defaults.stdev = 12;
        this.defaults.x = null;
        this.defaults.y = null;
        this.defaults.bgmode = 'avg';

        // Inherited.
        this.base_element_constructor(pSketchpad, pScript, this.defaults);
    }

    // Extend the class from its base class.
    var p = osweb.extendClass(noise, osweb.base_element);

    /*
     * Definition of public methods (run cycle).   
     */

    p.draw = function() {
        // Inherited.	
        this.base_element_draw();

        // Draw the noise element to the canvas of the sketchpad.
        this.sketchpad.canvas.noise(this._properties.x, this._properties.y, this._properties.env, this._properties.size,
            this._properties.stdev, this._properties.color1, this._properties.color2, this._properties.bgmode);
    };

    // Bind the noise class to the osweb namespace.
    osweb.noise = osweb.promoteClass(noise, "base_element");
}());