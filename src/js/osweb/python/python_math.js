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
    };
     
    // Definition of public methods - Number-theoretic and representation functions.

    
    ceil(x) {
    }

    copysign(x, y) {
    }

    fabs(x) {
    }

    factorial(x) {
    }

    floor(x) {
        return Math.floor(x);
    }

    fmod(x, y) {
    }

    frexp(x) {
    }

    fsum(iterable) {
    }

    acos(x) {
        return Math.acos(x);
    }

    asin(x) {
        return Math.asin(x);
    }

    atan(x) {
        return Math.atan(x);
    }

    atan2(y, x) {
        return Math.atan2(y, x);
    }

    cos(x) {
        return Math.cos(x);
    }

    hypot(x, y) {
    }

    sin(x) {
        return Math.sin(x);
    }

    tan(x) {
        return Math.tan(x);
    }
}
 