"use strict";
// Definition of the class Parameters.
function parameters() {
    throw 'The class parameters cannot be instantiated!';
}

// Define the private properties. 
parameters._itemCounter = 0;
parameters._parameters = new Array();

/** Initialize the parameters class. */
parameters._initialize = function() {
    // Check if subject parameter is already defined.
    if (osweb.runner._subject !== null) {
        // Set the subject number
        osweb.runner.experiment.set_subject(osweb.runner._subject);

        // Parameters are processed, next phase.
        osweb.screen._setupClickScreen();
    } else { 
        // Set properties if defined.
        var parameter = {
            dataType: '0',
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
};

/** Process all parameters within the parameter list. */
parameters._processParameters = function() {
    // Process all items for which a user input is required.
    if (this._itemCounter < this._parameters.length) {
        // Process a  parameter.
        this._processParameter(this._parameters[this._itemCounter]);
    } else {
        // Transfer the startup info to the context.
        this._transferParameters();
    }
};

/**
 * Process a single parameter
 * @param {Object} parameter - The parameter which must be processed.
 */
parameters._processParameter = function(parameter) {
    // Check if a user request is required.
    if (parameter.promptEnabled == true) {
        // Create the alertify prompt.
        alertify.prompt( 
            parameter.title, 
            parameter.prompt, 
            parameter.defaultValue, 
            function(evt, value) {
                // Get the response information
                parameter.response = value;
            
                // Increase the counter.
                this._itemCounter++;
            
                // Continue processing.
                this._processParameters();
            }.bind(this), 
            function() {
                // Finalize the introscreen elements.
                osweb.runner._exit();
            }
        );
    } else {
        // Assign default value to the Startup item.
        parameter.response = parameter.defaultValue;

        // Increase the counter.
        this._itemCounter++;

        // Continue processing.
        this._processParameters();
    }
};

/** Transfer the startup info items to the context. */
parameters._transferParameters = function() {
    // Transfer the startup info items to the context.
    for (var i = 0; i < this._parameters.length; i++) {
        // Additional run for subject_nr
        if (this._parameters[i].name == 'subject_nr') {
            osweb.runner.experiment.set_subject(this._parameters[i].response);
        } else {
            osweb.runner.experiment.vars.set(this._parameters[i].name, this._parameters[i].response);
        }    
    }
    
    // Parameters are processed, next phase.
    osweb.screen._setupClickScreen();
};

/**
 * Resizes the container div (osweb_div), which contains all elements on display
 * @param  {int} width  width to set
 * @param  {int} height height to set
 * @return void
 */
parameters._resizeOswebDiv = function(width, height) {
    // Set the parent container dimensions.
    osweb.runner._container.style.width = width + 'px';
    osweb.runner._container.style.height = height + 'px';
};

// Bind the parameters class to the osweb namespace.
module.exports = parameters;