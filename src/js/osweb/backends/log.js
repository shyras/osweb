/** Class representing a data logger. */
export default class Log {
    /**
     * Create a log object which stores all the response data.
     * @param {Object} experiment - The experiment to which the logger belongs.
     * @param {String} path - The path where to store the result data.
     */
    constructor(experiment, path) {
        // Create and set private properties. 
        this._all_vars = null; // If true all variables are written to the log.  
        this._header_written = false; // If true the header has been written to the log.
        this._log = []; // Array containing the log entries.
        this._path = ''; // Path to wich the log is written.

        // Create and set public properties. 
        this.experiment = experiment; // Anchor to the experiment object.
        this.experiment.vars.logfile = path; // Store the path location into the vars list.   
    };

    /**
     * Retrieves a list of all variables that exist in the experiment.
     * @return {Array} - A list of all variables.
     */
    all_vars() {
        // Retrieves a list of all variables that exist in the experiment.
        if (this._all_vars === null) {
            this._all_vars = this.experiment.vars.inspect();
        }
        return this._all_vars;
    }

    /** Closes the current log. */
    close() {
        // Closes the current log.
        if (this._log.length > 0) {
            // Echo the data to the runner.
            this.experiment._runner.data = this._log.join('');
        };

        // Clear the log file.
        this._log = [];
    }

    /** Flush the log file. */
    flush() {
        // Flush the log file.
        this._log = [];
    }   

    /**
     * Opens the current log. If a log was already open, it is closed. 
     * @param {String} path - Path for the log file.
     */
    open(path) {
        // Opens the current log. If a log was already open, it is closed.
        this._header_written = false;
        this._path = path;

        // Check for old data.
        if (this._log !== null) {
            // Clear the old data.
            this.close();
        }
    }

    /**
     * Write one signle line to the message log. 
     * @param {String} msg - Message to add to the log file.
     * @param {Boolean} newLine - If true a new line character is inserted into the message.
     */
    write(msg, newLine) {
        // Write one message to the log.
        newLine = (typeof newLine === 'undefined') ? true : newLine;

        // Write a new line.
        if (newLine === true) {
            this._log.push(msg + '\n');
        } else {
            // Write the Message line.
            this._log.push(msg);
        }
    }

    /**
     * Write one signle line to the message log. 
     * @param {Array} varList - Array with variables to write to the log.
     */
    write_vars(varList) {
        // Writes variables to the log.
        varList = (typeof varList === 'undefined') ? null : varList;

        var value;
        var l = [];
        // If no var list defines, retrieve all variable.
        if (varList === null) {
            varList = this.all_vars();
        }

        // Sort the var list.
        varList.sort();

        // Add the header to the log file.
        if (this._header_written === false) {
            for (var i = 0; i < varList.length; i++) {
                l.push('"' + varList[i] + '"');
            }
            this.write(l.join());
            this._header_written = true;
        }

        // Add the data entries to the log file.        
        l = [];
        entry = {};
        for (var i = 0; i < varList.length; i++) {
            value = this.experiment.vars.get(varList[i], 'NA', false);
            l.push('"' + value + '"');
            entry[varList[i]] = value
        }
        this.write(l.join());
        this.experiment.onLog(entry);
    }
}
 