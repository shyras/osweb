import filbert from 'filbert';

/** Class implementing a python math library. */
export default class PythonMath {
    /**
     * Create a python AST runner.
     * @param {Object} runner - The runner to which the library belongs.
     */
    constructor(runner) {
        // Set class parameter properties.
        this._runner = runner; // Parent runner attached to the library.

        // Set class properties.
        this.e = Math.E;
        this.pi = Math.PI;
    }

    /** Initialization phase of the python_math class. */
    _initialize() {
        // Insert math library methods into the python interpreter.
        filbert.pythonRuntime.imports['math'] = {};
        filbert.pythonRuntime.imports['math']['ceil'] = this.ceil; 
        filbert.pythonRuntime.imports['math']['copysign'] = this.copysign; 
        filbert.pythonRuntime.imports['math']['fabs'] = this.fabs; 
        filbert.pythonRuntime.imports['math']['factorial'] = this.factorial; 
        filbert.pythonRuntime.imports['math']['floor'] = this.floor; 
        filbert.pythonRuntime.imports['math']['fmod'] = this.fmod; 
        filbert.pythonRuntime.imports['math']['frexp'] = this.frexp; 
        filbert.pythonRuntime.imports['math']['fsum'] = this.fsum; 
        filbert.pythonRuntime.imports['math']['acos'] = this.acos; 
        filbert.pythonRuntime.imports['math']['asin'] = this.asin; 
        filbert.pythonRuntime.imports['math']['atan'] = this.atan; 
        filbert.pythonRuntime.imports['math']['atan2'] = this.atan2; 
        filbert.pythonRuntime.imports['math']['cos'] = this.cos; 
        filbert.pythonRuntime.imports['math']['hypot'] = this.hypot; 
        filbert.pythonRuntime.imports['math']['sin'] = this.sin; 
        filbert.pythonRuntime.imports['math']['tan'] = this.tan; 
        filbert.pythonRuntime.imports['math']['e'] = this.e; 
        filbert.pythonRuntime.imports['math']['pi'] = this.pi; 
    }
     
    /** Import 'ceil' function for osweb script. */
    ceil(x) {
    }

    /** Import 'copysign' function for osweb script. */
    copysign(x, y) {
    }

    /** Import 'fabs' function for osweb script. */
    fabs(x) {
    }

    /** Import 'factorial' function for osweb script. */
    factorial(x) {
    }

    /** Import 'floor' function for osweb script. */
    floor(x) {
        return Math.floor(x);
    }

    /** Import 'fmod' function for osweb script. */
    fmod(x, y) {
    }

    /** Import 'frexp' function for osweb script. */
    frexp(x) {
    }

    /** Import 'fsum' function for osweb script. */
    fsum(iterable) {
    }

    /** Import 'acos' function for osweb script. */
    acos(x) {
        return Math.acos(x);
    }

    /** Import 'asin' function for osweb script. */
    asin(x) {
        return Math.asin(x);
    }

    /** Import 'atan' function for osweb script. */
    atan(x) {
        return Math.atan(x);
    }

    /** Import 'atan2' function for osweb script. */
    atan2(y, x) {
        return Math.atan2(y, x);
    }

    /** Import 'cos' function for osweb script. */
    cos(x) {
        return Math.cos(x);
    }

    /** Import 'hypot' function for osweb script. */
    hypot(x, y) {
    }

    /** Import 'sin' function for osweb script. */
    sin(x) {
        return Math.sin(x);
    }

    /** Import 'tan' function for osweb script. */
    tan(x) {
        return Math.tan(x);
    }
}
 