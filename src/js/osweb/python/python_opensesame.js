import filbert from 'filbert';
import Canvas from '../backends/canvas.js';

/** Class implementing a python opensesame library. */
export default class PythonOpenSesame {
    /**
     * Create a python AST runner.
     * @param {Object} runner - The runner to which the library belongs.
     */
    constructor(runner) {
        // Set class parameter properties.
        this._runner = runner; // Parent runner attached to the library.
    }

    /** Initialization phase of the python_library class. */
    _initialize() {
        this._objects = {};
        
        // Insert clock class into the python interpreter.
        filbert.pythonRuntime.imports['clock'] = {};
        filbert.pythonRuntime.imports['clock']['sleep'] = this._runner._experiment.clock.sleep; 
        filbert.pythonRuntime.imports['clock']['time'] = this._runner._experiment.clock.time; 

        // Insert log class into the python interpreter.
        filbert.pythonRuntime.imports['log'] = {};
        filbert.pythonRuntime.imports['log']['close'] = this._runner._experiment._log.close; 
        filbert.pythonRuntime.imports['log']['open'] = this._runner._experiment._log.open; 
        filbert.pythonRuntime.imports['log']['write'] = this._runner._experiment._log.write; 
        filbert.pythonRuntime.imports['log']['write_vars'] = this._runner._experiment._log.write_vars; 

        // Insert var class into the python interpreter.
        filbert.pythonRuntime.imports['var'] = this._runner._experiment.vars;
        filbert.pythonRuntime.imports['var']['get'] = this._runner._experiment.vars.get; 
        filbert.pythonRuntime.imports['var']['has'] = this._runner._experiment.vars.has; 
        filbert.pythonRuntime.imports['var']['set'] = this._runner._experiment.vars.set; 
        filbert.pythonRuntime.imports['var']['unset'] = this._runner._experiment.vars.unset;  

        // Insert general opensesame methods into the python interpreter.
        filbert.pythonRuntime.functions['reset_feedback'] = this._runner._experiment.reset_feedback; 
        filbert.pythonRuntime.functions['set_subject_nr'] = this._runner._experiment.set_subject; 
        filbert.pythonRuntime.functions['canvas'] = this.canvas; 
        filbert.pythonRuntime.functions['copy_sketchpad'] = this.copy_sketchpad; 
        filbert.pythonRuntime.functions['keyboard'] = this.keyboard; 
        filbert.pythonRuntime.functions['mouse'] = this.mouse; 
        filbert.pythonRuntime.functions['pause'] = this.pause; 
        filbert.pythonRuntime.functions['set_subject_nr'] = this.set_subject_nr; 
        filbert.pythonRuntime.functions['sometimes'] = this.sometimes; 
        filbert.pythonRuntime.functions['synth'] = this.synth; 
        filbert.pythonRuntime.functions['xy_circle'] = this.xy_circle; 
        filbert.pythonRuntime.functions['xy_distance'] = this.xy_distance; 
        filbert.pythonRuntime.functions['xy_from_polar'] = this.xy_from_polar; 
        filbert.pythonRuntime.functions['xy_grid'] = this.xy_grid; 
        filbert.pythonRuntime.functions['xy_random'] = this.xy_random; 
        filbert.pythonRuntime.functions['xy_to_polar'] = this.xy_to_polar;  
    }

    /** Import 'canvas' function for osweb script. */
    canvas(auto_prepare, style_args) {
        return new Canvas(this._runner._experiment, auto_prepare, style_args);
    }

    /** Import 'copy_sketchpad' function for osweb script. */
    copy_sketchpad(name) {
    }

    /** Import 'keyboard' function for osweb script. */
    keyboard(resp_args) {
    }

    /** Import 'mouse' function for osweb script. */
    mouse(resp_args) {
    }

    /** Import 'pause' function for osweb script. */
    pause(test) {
    }

    /** Import 'sampler' function for osweb script. */
	sampler(src, playback_args) {
    }

    /** Import 'set_response' function for osweb script. */
    set_response(response, response_time, correct) {
    }

    /** Import 'sometimes' function for osweb script. */
    sometimes(p) {
    }

    /** Import 'synth' function for osweb script. */
    synth(osc, freq, length, attack, decay) {
    }

    /** Import 'xy_circle' function for osweb script. */
    xy_circle(n, rho, phi0, pole) {
    }

    /** Import 'xy_distance' function for osweb script. */
    xy_distance(x1, y1, x2, y2) {
    }

    /** Import 'xy_from_polar' function for osweb script. */
    xy_from_polar(rho, phi, pole) {
    }

    /** Import 'xy_grid' function for osweb script. */
    xy_grid(n, spacing, pole) {
    }

    /** Import 'xy_random' function for osweb script. */
    xy_random(n, width, height, min_dist, pole) {
    }

    /** Import 'xy_to_polar' function for osweb script. */
    xy_to_polar(x, y, pole) {
    }
}
 