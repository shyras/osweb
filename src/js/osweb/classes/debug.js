"use strict";
function debug() {
    throw 'The class debug cannot be instantiated!';
}

// Definition of public properties.
debug.enabled = true; // Enable the debugger  
debug.error = false; // true if an error occured.
debug.messageLog = new Array(); // Arraty with alle log messages.

// Definition of class private methods.               

debug._initialize = function() {
    // Enabled/disable the debugger.
    this.debug = osweb.runner.debug;
    // Clear the log.
    this.messageLog = [];
};

debug._finalize = function() {
    // If enabled push the messages to the javascript console.
    if (this.enabled === true) {
        console.log(this.messageLog);
    }

    // Clear the log.
    this.messageLog = [];
};

// Definition of the public methods.               

debug.addError = function(error_text) {
    // Set the error flag.
    this.error = true;

    // Show the fatal error warning.
    console.log(error_text);
    console.log(osweb.constants.ERROR_001);

    // Set status of the runner.
    osweb.runner.status = osweb.constants.RUNNER_ERRROR;

    // Throw the exception.
    throw new Error(error_text);
};

debug.addMessage = function(message_text) {
    // Push the error message to the log.
    this.messageLog.push(message_text);

    if (debug.enabled === true) {
        console.log(message_text);
    }
};

debug.msg = function(message_text) {
    // Push the error message to the log.
    this.addMesage(message_text);
};

// Bind the debug class to the osweb namespace.
module.exports = debug;
