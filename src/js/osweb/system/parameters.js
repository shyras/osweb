import { isFunction } from 'underscore';

/** Class representing a parameter processor. */
export default class Parameters {
    /**
     * Create an session class which stores information about the client system.
     * @param {Object} runner - The runner class to which the debugger belongs.
     */
    constructor(runner) {
        // Create and set private properties. 
        this._itemCounter = 0; // Number of active parameter.
        this._parameters = new Array(); // All parameters to process.
        this._runner = runner; // Parent runner attached to the session object. 
    }     

    /** Initialize the parameters class. */
    _initialize() {
        // Check if subject parameter is already defined.
        if (this._runner._subject !== null) {
            // Set the subject number
            this._runner._experiment.set_subject(this._runner._subject);

            // Parameters are processed, next phase.
            this._runner._screen._setupClickScreen();
        } else { 
            // Update inroscreen.
            this._runner._screen._updateIntroScreen('Retrieving input parameters.');

            // Set properties if defined.
            var parameter = {
                dataType: 'number',
                defaultValue: '0',
                name: 'subject_nr',
                title: 'Starting the experiment',
                prompt: 'Please enter the subject number',
                promptEnabled: true
            };

            // Add the subject parameter to the parameters list.
            this._parameters.push(parameter);
    
            // Process the Parameters.        
            this._processParameters();
        }    
    }

    /** Process all parameters within the parameter list. */
    _processParameters() {
        // Process all items for which a user input is required.
        if (this._itemCounter < this._parameters.length) {
            // Process a  parameter.
            this._processParameter(this._parameters[this._itemCounter]);
        } else {
            // Transfer the startup info to the context.
            this._transferParameters();
        }
    }

    /**
     * Callback function for dialog when aits OK button has been clicked.
     * @param {Object} parameter - The parameter to set.
     * @param {String} value - The value to set.
     */
    _onParamConfirm(parameter, value) {
         // Get the response information
        parameter.response = value;

        // Increase the counter.
        this._itemCounter++;

        // Continue processing.
        this._processParameters();
    }

    /** Callback function for dialog when its cancel button has been clicked. */
    _onParamCancel() {
        // Exit the runner.
        this._runner._exit();
    }

    /**
     * Process a single parameter
     * @param {Object} parameter - The parameter which must be processed.
     */
    _processParameter(parameter) {
        // Check if a user request is required.
        if (parameter.promptEnabled === true) {                     
            // Use passed function that displays a prompt. This leaves the display
            // of the prompt to the library or system that implements osweb.
            if (isFunction(this._runner._prompt)) {
                this._runner._prompt( parameter.title, parameter.prompt, 
                    parameter.defaultValue, parameter.dataType, 
                    this._onParamConfirm.bind(this, parameter), this._onParamCancel.bind(this));
            } else {
                // Fallback to the window prompt if no function has been passed.
                result = window.prompt(parameter.prompt, parameter.defaultValue);

                if( result === null ){
                    this._onParamCancel();
                } else {
                    this._onParamConfirm(parameter, result);
                }
            }
        } else {
            // Assign default value to the Startup item.
            parameter.response = parameter.defaultValue;

            // Increase the counter.
            this._itemCounter++;

            // Continue processing.
            this._processParameters();
        }
    }

    /** Transfer the startup info items to the context. */
    _transferParameters() {
        // Transfer the startup info items to the context.
        for (var i = 0; i < this._parameters.length; i++) {
            // Additional run for subject_nr
            if (this._parameters[i].name === 'subject_nr') {
                this._runner._experiment.set_subject(this._parameters[i].response);
            } else {
                this._runner._experiment.vars.set(this._parameters[i].name, 
                    this._parameters[i].response);
            }    
        }
    
        // Parameters are processed, next phase.
        this._runner._screen._setupClickScreen();
    }
}
 