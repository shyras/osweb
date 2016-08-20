/*
 * Definition of the class base_element.
 */

function base_element(pSketchpad, pScript, pDefaults) {
    // Set the public properties.		
    this.canvas = pSketchpad.canvas;
    this.defaults = pDefaults;
    this.defaults.show_if = 'always';
    this.defaults.z_index = 0;
    this.experiment = pSketchpad.experiment;
    this.fix_coordinates = (pSketchpad.vars.uniform_coordinates == 'yes');
    this.name = pSketchpad.name;
    this.only_keywords = false;
    this.pool = pSketchpad.experiment.pool;
    this.sketchpad = pSketchpad;
    this.syntax = pSketchpad.syntax;
    this.vars = pSketchpad.vars;

    // Set the private properties.		
    this._properties = null;

    // Read the definition string.
    this.from_string(pScript);
};

// Extend the class from its base class.
var p = base_element.prototype;

// Set the class public properties. 
p.defaults = {};
p.fix_coordinates = true;
p.only_keywords = false;
p.properties = {};
p.sketchpad = null;
p.vars = null;

/*
 * Definition of public methods - building cycle.         
 */

p.from_string = function(pString) {
    var tokens = osweb.syntax.parse_cmd(pString);

    // Set the default properties.
    this.properties = {};

    // Set the define properties.
    for (var i = 0; i < tokens.length; i++) {
        var name = tokens[i].slice(0, tokens[i].indexOf('='));
        var value = tokens[i].slice(tokens[i].indexOf('=') + 1, tokens[i].length);
        var value = osweb.syntax.remove_quotes(value);

        // Set (and overwrite) the properties.
        this.properties[name] = value;
    }
};

/*
 * Definition of public methods - running cycle.         
 */

p.z_index = function() {
    //  Determines the drawing order of the elements. 
    return this.properties.z_index;
};

p.eval_properties = function() {
    // Evaluates all properties and return them.
    this._properties = {};

    var xc = this.experiment.vars.width / 2;
    var yc = this.experiment.vars.height / 2;

    for (var property in this.properties) {
        var value = this.sketchpad.syntax.eval_text(this.properties[property]);
        /* if var == u'text':
		round_float = True
            else:
		round_float = False
	val = self.sketchpad.syntax.auto_type(
		self.sketchpad.syntax.eval_text(val, round_float=round_float))
	if self.fix_coordinates and type(val) in (int, float): */
        if ((property == 'x') || (property == 'x1') || (property == 'x2')) {
            value = Number(value) + xc;
        };
        if ((property == 'y') || (property == 'y1') || (property == 'y2')) {
            value = Number(value) + yc;
        };

        this._properties[property] = value;
    }
};

p.is_shown = function() {
    // Set the self of the current workspace.
    this.experiment.python_workspace['self'] = this.sketchpad;

    // Determines whether the element should be shown, based on the show-if statement.
    return this.experiment.python_workspace._eval(this.experiment.syntax.compile_cond(this.properties['show_if']));
};

p.draw = function() {
    // Calculate the dynamic properties.
    this.eval_properties();
};

// Bind the base_element class to the osweb namespace.
module.exports = base_element;
