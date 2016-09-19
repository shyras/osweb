module.exports = function(osweb){
    "use strict";
    
    // Class python_opensesame - Python OpenSesame functions.      
    function python_opensesame() {
        throw 'The class python_opensesame cannot be instantiated!';
    };

    // Definition of private methods.   

    python_opensesame._initialize = function() {
        // Insert clock methods into the python interpreter.
        filbert.pythonRuntime.imports['clock'] = {};
        filbert.pythonRuntime.imports['clock']['sleep'] = window['clock'].sleep; 
        filbert.pythonRuntime.imports['clock']['time'] = window['clock'].time; 

        // Insert opensesame methods into the python interpreter.
        filbert.pythonRuntime.functions['canvas'] = this.canvas; 
        filbert.pythonRuntime.functions['copy_sketchpad'] = this.copy_sketchpad; 
        filbert.pythonRuntime.functions['keyboard'] = this.keyboard; 
        filbert.pythonRuntime.functions['mouse'] = this.mouse; 
        filbert.pythonRuntime.functions['pause'] = this.pause; 
        filbert.pythonRuntime.functions['reset_feedback'] = this.reset_feedback; 
        filbert.pythonRuntime.functions['set_response'] = this.set_response; 
        filbert.pythonRuntime.functions['set_subject_nr'] = this.set_subject_nr; 
        filbert.pythonRuntime.functions['sometimes'] = this.sometimes; 
        filbert.pythonRuntime.functions['synth'] = this.synth; 
        filbert.pythonRuntime.functions['xy_circle'] = this.xy_circle; 
        filbert.pythonRuntime.functions['xy_distance'] = this.xy_distance; 
        filbert.pythonRuntime.functions['xy_from_polar'] = this.xy_from_polar; 
        filbert.pythonRuntime.functions['xy_grid'] = this.xy_grid; 
        filbert.pythonRuntime.functions['xy_random'] = this.xy_random; 
        filbert.pythonRuntime.functions['xy_to_polar'] = this.xy_to_polar; 
    };

    // Definition of public methods - global functions.   

    python_opensesame.canvas = function(auto_prepare, style_args) {
        return new osweb.canvas(auto_prepare, style_args);
    };

    python_opensesame.copy_sketchpad = function(name) {
    };

    python_opensesame.keyboard = function(resp_args) {
    };

    python_opensesame.mouse = function(resp_args) {
    };

    python_opensesame.pause = function(test) {
        console.log('pause' + test);
    };

    python_opensesame.reset_feedback = function() {
    };

    python_opensesame.sampler = function(src, playback_args) {
    };

    python_opensesame.set_response = function(response, response_time, correct) {
    };

    python_opensesame.set_subject_nr = function(nr) {
    };

    python_opensesame.sometimes = function(p) {
    };

    python_opensesame.synth = function(osc, freq, length, attack, decay) {
    };

    python_opensesame.xy_circle = function(n, rho, phi0, pole) {
    };

    python_opensesame.xy_distance = function(x1, y1, x2, y2) {
    };

    python_opensesame.xy_from_polar = function(rho, phi, pole) {
    };

    python_opensesame.xy_grid = function(n, spacing, pole) {
    };

    python_opensesame.xy_random = function(n, width, height, min_dist, pole) {
    };

    python_opensesame.xy_to_polar = function(x, y, pole) {
    };

    // Bind the python_math class to the osweb namespace.
    return python_opensesame;
};
