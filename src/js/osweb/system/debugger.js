import { constants } from './constants.js';

/** Class representing a debugger. */
export default class Debugger {
    /**
     * Create a debugger which handles errors and messahes during an session.
     * @param {Object} runner - The runner class to which the debugger belongs.
     */
    constructor(runner) {
        // Create and set private properties. 
        this._runner = runner; // Parent runner attached to the debugger.    

        // Create and set public properties. 
        this.enabled = true; // Enable the debugger.  
        this.error = false; // True if an error occured.
        this.messageLog = new Array(); // Arraty with alle log messages.
    }   

    /** Initialize the debugger object class. */
    _initialize() {
        // Clear the log.
        this.messageLog = [];
    }

    /** Finalize the debugger object class. */
    _finalize() {
        // If enabled push the messages to the javascript console.
        if (this.enabled === true) {
            console.log(this.messageLog);
        }

        // Clear the log.
        this.messageLog = [];
    }

    /**
     * Show a fatal error to the user and stops the running of the experiment.
     * @param {String} error_text - The error shown to the user.
     */
    addError(error_text) {
        // Set the error flag.
        this.error = true;

        // Set status of the event system to break.
        this._runner._events.state = constants.TIMER_ERROR;

        // Throw the exception.
        console.error('OSWeb has stopped running due to a fatal error.');
        throw new Error(error_text);
    }

    /**
     * Add a message to the debugger list.
     * @param {String} message - The message to be added to the list.
     */
    addMessage(message_text) {
        // Push the error message to the log.
        this.messageLog.push(message_text);

        if (this.enabled === true) {
            console.log(message_text);
        }
    }

    /**
     * Mirror function for the AddMessage method.
     * @param {String} message_text - The message to be added to the list.
     */
    msg(message_text) {
        // Push the error message to the log.
        this.addMesage(message_text);
    }
}
 