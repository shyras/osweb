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

        /* // Insert var class into the python interpreter.
        filbert.pythonRuntime.imports['var'] = window['vars'];
        filbert.pythonRuntime.imports['var']['get'] = window['vars'].get; 
        filbert.pythonRuntime.imports['var']['has'] = window['vars'].has; 
        filbert.pythonRuntime.imports['var']['set'] = window['vars'].set; 
        filbert.pythonRuntime.imports['var']['unset'] = window['vars'].unset;  */

        // Insert general opensesame methods into the python interpreter.
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
    }

    // Definition of public methods - global functions.   

    canvas(auto_prepare, style_args) {
        return new osweb.canvas(auto_prepare, style_args);
    }

    copy_sketchpad(name) {
    }

    keyboard(resp_args) {
    }

    mouse(resp_args) {
    }

    pause(test) {
        console.log('pause' + test);
    }

    reset_feedback() {
    }

    sampler(src, playback_args) {
    }

    set_response(response, response_time, correct) {
    }

    set_subject_nr(nr) {
    }

    sometimes(p) {
    }

    synth(osc, freq, length, attack, decay) {
    }

    xy_circle(n, rho, phi0, pole) {
    }

    xy_distance(x1, y1, x2, y2) {
    }

    xy_from_polar(rho, phi, pole) {
    }

    xy_grid(n, spacing, pole) {
    }

    xy_random(n, width, height, min_dist, pole) {
    }

    xy_to_polar(x, y, pole) {
    }
}
 