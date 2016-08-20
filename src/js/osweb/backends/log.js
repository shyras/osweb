// Definition of the class log.
function log(experiment, path) {
    // Set the class private properties. 
    this._all_vars = null; // If true all variables are written to the log.  
    this._header_written = false; // If true the header has been written to the log.
    this._log = []; // Array containing the log entries.
    this._path = ''; // Path to wich the log is written.

    // Set the class public properties. 
    this.experiment = experiment; // Anchor to the experiment object.
    this.experiment.vars.logfile = path; // Store the path location into the vars list.   
};

// Extend the class from its base class.
var p = log.prototype;

// Definition of public properties. 
p.experiment = null;

// Definition of public methods.   

p.all_vars = function() {
    // Retrieves a list of all variables that exist in the experiment.
    if (this._all_vars === null) {
        this._all_vars = this.experiment.vars.inspect();
    }
    return this._all_vars;
};

p.close = function() {
    // Closes the current log.
    if (this._log.length > 0) {
        // Echo the data to the runner.
        osweb.runner.data = this._log.join('');
    };

    // Clear the log file.
    this._log = [];
};

p.flush = function() {
    // Flush the log file.
    this._log = [];
};

p.open = function(path) {
    // Opens the current log. If a log was already open, it is closed.
    this._header_written = false;
    this._path = path;

    // Check for old data.
    if (this._log !== null) {
        // Clear the old data.
        this.close();
    }
};

p.write = function(msg, new_line) {
    // Write one message to the log.
    new_line = (typeof new_line === 'undefined') ? true : new_line;

    // Write a new line.
    if (new_line === true) {
        this._log.push(msg + '\n');
    } else {
        // Write the Message line.
        this._log.push(msg);
    }
};

p.write_vars = function(var_list) {
    // Writes variables to the log.
    var_list = (typeof var_list === 'undefined') ? null : var_list;

    var value;
    var l = [];
    // If no var list defines, retrieve all variable.
    if (var_list == null) {
        var_list = this.all_vars();
    }

    // Sort the var list.
    var_list.sort();

    // Add the header to the log file.
    if (this._header_written === false) {
        for (var i = 0; i < var_list.length; i++) {
            l.push('"' + var_list[i] + '"');
        }
        this.write(l.join());
        this._header_written = true;
    }

    // Add the data entries to the log file.        
    l = [];
    for (var i = 0; i < var_list.length; i++) {
        value = this.experiment.vars.get(var_list[i], 'NA', false);
        l.push('"' + value + '"');
    }
    this.write(l.join());
};

// Bind the log class to the osweb namespace.
module.exports = log;