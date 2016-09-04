/*
* Definition of the class item.
*/
"use strict";

function item(pExperiment, pName, pScript) {
    // Set the class private properties.
    this._get_lock = null;
    this._parent = null;
    this._status = osweb.constants.STATUS_NONE;

    // Set the class public properties.
    this.count = 0;
    this.debug = osweb.debug.enabled;
    this.experiment = (pExperiment == null) ? this : pExperiment;
    this.name = pName;
    
    // Determine the parent item varstore.
    var parent_varstore = (this.experiment == pExperiment) ? this.experiment.vars : null
    this.vars = (this.vars) ? this.vars : new osweb.var_store(this, parent_varstore);

    // Set the object realted properties.
    this.clock = this.experiment._clock;
    this.log = this.experiment._log;
    this.python_workspace = this.experiment._python_workspace;
    this.syntax = this.experiment._syntax;

    // Read the item definition string.	
    this.from_string(pScript);
}

// Extend the class from its base class.
var p = item.prototype;

// Definition of class public properties. 
p.clock = null;
p.comments = null;
p.count = 0;
p.debug = false;
p.experiment = null;
p.log = null;
p.name = '';
p.syntax = null;
p.python_workspace = null;
p.vars = null;
p.variables = null;

/*
 * Definition of public methods - general function.
 */

p.dummy = function() {
    // Dummy function, continue execution of an item directly.
};

p.resolution = function() {
    /* // Returns the display resolution and checks whether the resolution is valid.
var w = this.vars.get('width');
var h = this.vars.get('height');
if ((typeof w !== 'number') || (typeof h !== 'number'))
{
    osweb.debug.addError('(' + String(w) + ',' + String(h) + ') is not a valid resolution');
}

return [w, h]; */
};

p.set_response = function(pResponse, pResponse_time, pCorrect) {
    // Processes a response in such a way that feedback variables are updated as well.
    console.log('warning: method "item.set_response" not implemented yet.');
};

p.sleep = function(pMs) {
    // Pauses the object execution. !WARNING This function can not be implemented due the script blocking of javascript.
    this.clock.sleep(pMs);
};

p.time = function() {
    // Returns the current time.
    return this.clock.time();
};

/*
 * Definition of public methods - build cycle.         
 */

p.from_string = function(pString) {
    // Parses the item from a definition string.
    osweb.debug.addMessage('');
    this.variables = {};
    this.reset();
    this.comments = [];
    this.reset();

    // Split the string into an array of lines.  
    if (pString != null) {
        var lines = pString.split('\n');
        for (var i = 0; i < lines.length; i++) {
            if ((lines[i] != '') && (this.parse_variable(lines[i]) == false)){
                this.parse_line(lines[i]);
            }
        }
    }
};

p.parse_comment = function(pLine) {
    // Parses comments from a single definition line, indicated by # // or '.
    pLine = pLine.trim();
    if ((pLine.length > 0) && (pLine.charAt(0) == '#')) {
        // Add comments to the array removing the first character.
        this.comments.push(pLine.slice(1));

        return true;
    } else if ((pLine.length > 1) && (pLine.charAt(0) == '/')) {
        // Add comments to the array removing the first two characters.
        this.comments.push(pLine.slice(2));

        return true;
    } else {
        return false;
    }
};

p.parse_keyword = function(pLine, pFrom_ascii, pEval) {};

p.parse_line = function(pLine) {
    // Allows for arbitrary line parsing, for item-specific requirements.
};

p.parse_variable = function(pLine) {
    // Reads a single variable from a single definition line.
    if (this.parse_comment(pLine)) {
        return true;
    } else {
        var cmd, args, kwargs;
        // Split the single line into a set of tokens.
        [cmd, args, kwargs] = osweb.syntax.parse_cmd(pLine);
        if (cmd == "set"){
            if (args.length != 2) {
                osweb.debug.addError('Error parsing variable definition: ' + pLine);
                alertify.errorAlert('Error parsing variable definition: ' + pLine);
            } else {
                this.vars.set(args[0], args[1]);
                return true;
            }
        } else {
            return false;
        }
    }
};

/*
 * Definition of public methods - runn cycle. 
 */

p.reset = function() {
    // Resets all item variables to their default value.
};

p.prepare = function() {
    // Implements the prepare phase of the item.
    this.experiment.vars.set('count_' + this.name, this.count);
    this.count++;

    // Set the status to initialize.
    this._status = osweb.constants.STATUS_INITIALIZE;

    // For debugging.
    osweb.debug.addMessage('prepare' + this.name);

    // Implements the complete phase of the item (to support blocking script in the prepare phase).
    if ((this._parent !== null) && (this.type !== 'feedback')) {
        // Prepare cycle of parent.
        this._parent.prepare_complete();
    }
};

p.prepare_complete = function() {
    // Dummy function for completion process.
};

p.set_item_onset = function(pTime) {
    // Set a timestamp for the item's executions
    var time = (pTime != null) ? pTime : this.clock.time();
    this.experiment.vars.set('time_' + this.name, time);
};

p.run = function() {
    // Implements the run phase of the item.
    osweb.debug.addMessage('run' + this.name);
};

p.update = function() {
    // Implements the update phase of the item.
};

p.update_response = function(pResponse) {
    // Implements the update_response phase of an item.
};

p.complete = function() {
    // Implements the complete phase of the item.
    if (this._parent !== null) {
        // Return the process control to the parent of the element.
        osweb.events._current_item = this._parent;
        osweb.events._current_item.run();
    }
};

// Bind the item class to the osweb namespace.
module.exports = item;