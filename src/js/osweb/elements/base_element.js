/** Class representing a general visual element. */
export default class BaseElement {
    /**
     * Create a log object which stores all the response data.
     * @param {Object} sketchpad - The sketchpad item that owns the visual element.
     * @param {String} script - The script containing properties of the visual element.
     * @param {Object} defaults - The default property values of the visual element.
     */
    constructor(sketchpad, script, defaults) {
        // Set class parameter properties.
        this.canvas = sketchpad.canvas;
        this.defaults = defaults;
        this.defaults.show_if = 'always';
        this.defaults.z_index = 0;
        this.experiment = sketchpad.experiment;
        this.fix_coordinates = (sketchpad.vars.uniform_coordinates === 'yes');
        this.name = sketchpad.name;
        this.only_keywords = false;
        this.pool = sketchpad.experiment.pool;
        this.properties = {};
        this.sketchpad = sketchpad;
        this.syntax = sketchpad.syntax;
        this.vars = sketchpad.vars;

        // Set the private properties.		
        this._properties = null;

        // Read the definition string.
        this.from_string(script);
    }

    /**
     * Parses the element from a definition string.
.    * @param {String} script - The definition script line to be parsed.
     */
    from_string(script) {
        var cmd, args;
        [cmd, args, this.properties] = this.sketchpad.syntax.parse_cmd(script);
    }

    /**
     * Determines the drawing order of the elements.  
     * @param {Number} - The drawing order (value) of the element.
     */
    z_index() {
        //  Determines the drawing order of the elements. 
        return this.properties.z_index;
    }

    /** Calculate the dynamic elements within properties. */
    eval_properties() {
        // Evaluates all properties and return them.
        this._properties = {};

        var xc = this.experiment.vars.width / 2;
        var yc = this.experiment.vars.height / 2;

        for (var property in this.properties) {
            var value = this.sketchpad.syntax.eval_text(this.properties[property], null, false);

            if ((property == 'x') || (property == 'x1') || (property == 'x2')) {
                value = Number(value) + xc;
            };
            if ((property == 'y') || (property == 'y1') || (property == 'y2')) {
                value = Number(value) + yc;
            };

            this._properties[property] = value;
        }
    }

    /**
     * Determines whether the element should be shown, based on the show-if statement.
.    * @return {Boolean} - Returns true if the element must be shown.
     */
    is_shown() {
        // Set the self of the current workspace.
        this.experiment.python_workspace['self'] = this.sketchpad;
        
        // Determines whether the element should be shown, based on the show-if statement.
        return this.experiment.python_workspace._eval(this.experiment.syntax.compile_cond(this.properties['show_if']));
    }

    /** Implements the draw phase of an element. */
    draw() {
        // Calculate the dynamic properties.
        this.eval_properties();
    }
}
