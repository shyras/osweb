
(function() {
    // Definition of the class python_workspace.
    function python_workspace_api() {
    	throw 'The class python_workspace_api cannot be instantiated!';
    }; 
	
    // Definition of private methods.   

    python_workspace_api._initialize = function() {
	// Create the global function calls for use in the inlide script item.
	window['canvas'] = this.canvas;
	window['copy_sketchpad'] = this.copy_sketchpad;
	window['keyboard'] = this.keyboard;
	window['mouse'] = this.mouse;
	window['pause'] = this.pause;
	window['reset_feedback'] = this.reset_feedback;	
	window['sampler'] = this.sampler;
	window['set_response'] = this.set_response;
	window['set_subject_nr'] = this.set_subject_nr;	
	window['sometimes'] = this.sometimes;
	window['synth'] = this.synth;
	window['xy_circle'] = this.xy_circle;
	window['xy_distance'] = this.xy_distance;
	window['xy_from_polar'] = this.xy_from_polar;
	window['xy_grid'] = this.xy_grid;
	window['xy_random'] = this.xy_random;
	window['xy_to_polar'] = this.xy_to_polar;
    };

    // Definition of public methods - global functions.   

    python_workspace_api.canvas = function(auto_prepare, style_args) {
        osweb.debug.addMessage(osweb.constants.MESSAGE_007 + 'canvas().');
    };

    python_workspace_api.copy_sketchpad = function(name) {
        osweb.debug.addMessage(osweb.constants.MESSAGE_007 + 'copy_sketchpad().');
    };

    python_workspace_api.keyboard = function(resp_args) {
        osweb.debug.addMessage(osweb.constants.MESSAGE_007 + 'keyboard().');
    };

    python_workspace_api.mouse = function(resp_args) {
        osweb.debug.addMessage(osweb.constants.MESSAGE_007 + 'mouse().');
    };

    python_workspace_api.pause = function() {
        osweb.debug.addMessage(osweb.constants.MESSAGE_007 + 'pause().');
    };

    python_workspace_api.reset_feedback = function() {
        osweb.debug.addMessage(osweb.constants.MESSAGE_007 + 'pause().');
    };

    python_workspace_api.sampler = function(src, playback_args) {
        osweb.debug.addMessage(osweb.constants.MESSAGE_007 + 'pause().');
    };

    python_workspace_api.set_response = function(response, response_time, correct) {
        osweb.debug.addMessage(osweb.constants.MESSAGE_007 + 'pause().');
    };
	
    python_workspace_api.set_subject_nr = function(nr) {
        osweb.debug.addMessage(osweb.constants.MESSAGE_007 + 'pause().');
    };

    python_workspace_api.sometimes = function(p) {
        osweb.debug.addMessage(osweb.constants.MESSAGE_007 + 'pause().');
    };

    python_workspace_api.synth = function(osc, freq, length, attack, decay) {
        osweb.debug.addMessage(osweb.constants.MESSAGE_007 + 'pause().');
    };

    python_workspace_api.xy_circle = function(n, rho, phi0, pole) {
        osweb.debug.addMessage(osweb.constants.MESSAGE_007 + 'cy_circle().');
    };

    python_workspace_api.xy_distance = function(x1, y1, x2, y2) {
        osweb.debug.addMessage(osweb.constants.MESSAGE_007 + 'xy_distance().');
    };

    python_workspace_api.xy_from_polar = function(rho, phi, pole) {
        osweb.debug.addMessage(osweb.constants.MESSAGE_007 + 'xy_from_polar().');
    };

    python_workspace_api.xy_grid = function(n, spacing, pole) {
        osweb.debug.addMessage(osweb.constants.MESSAGE_007 + 'xy_grid().');
    };

    python_workspace_api.xy_random = function(n, width, height, min_dist, pole) {
        osweb.debug.addMessage(osweb.constants.MESSAGE_007 + 'xy_random().');
    };

    python_workspace_api.xy_to_polar = function(x, y, pole) {
        osweb.debug.addMessage(osweb.constants.MESSAGE_007 + 'xy_to_polar().');
    };

    // Bind the python_workspace_api class to the osweb namespace.
    osweb.python_workspace_api = python_workspace_api;
}());
