import filbert from 'filbert';

/** Class implementing a python string library. */
export default class PythonString {
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
    }
    
    /** Import 'capitalize' function for osweb script. */
    capitalize() {
    }

    /** Import 'center' function for osweb script. */
    center(width, fillchar) {
    }

    /** Import 'upper' function for osweb script. */
    upper() {
    }
}
 