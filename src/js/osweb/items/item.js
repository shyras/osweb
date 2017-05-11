import { constants } from '../system/constants.js';
import VarStore from '../classes/var_store.js';
import Clock from '../backends/clock.js';

/** Class representing an OpenSesame item. */
export default class Item {
    constructor(experiment, name, script) {
        // Create and set private properties. 
        this._parent = null;
        this._runner = (experiment.constructor.name === 'Runner') ? experiment : experiment._runner;
        this._status = constants.STATUS_NONE;

        // Create and set public properties. 
        this.clock = (experiment.constructor.name === 'Runner') ? new Clock(this) : experiment.clock;
        this.count = 0;
        this.experiment = (experiment.constructor.name === 'Runner') ? this : experiment;
        this.name = name;
        this.python_workspace = this._runner._pythonWorkspace;
        this.response_store = this._runner._responseStore;
        this.syntax = this._runner._syntax;
        this.vars = new VarStore(this, (experiment.constructor.name === 'Runner') ? null : this.experiment.vars);
    }    

    /** Implements the complete phase of an item. */
    _complete() {
       // Adjust the status of the item.
       this._status = constants.STATUS_FINALIZE;

        // Implements the complete phase of the item.
        if (this._parent !== null) {
            // Return the process control to the parent of the element.
            this._runner._events._currentItem = this._parent;
            this._runner._events._currentItem.run();
        }
    }    

    /** Implements the prepare complete phase of an item. */
    _prepare_complete() {
    }

    /** Implements the update phase of an item. */
    _update(response) {
    }

    /**
     * Pauses the object execution. !WARNING This function can not be implemented due the script blocking of javascript.
     * @param {Number} pMs - The sleep time in milliseconds.
     */
    sleep(pMs) {
        this.clock.sleep(pMs);
    }

    /**
     * Returns the current time.   
     * @returns {Number} - The current time in ms from the start of the experiment.
     */
    time() {
        // Returns the current time.
        return this.clock.time();
    }

    /**
     * Parses comments from a single definition line, indicated by # // or '.
.    * @param {String} line - The definition line to be parsed.
     * @returns {Boolean} - Return true if the commennt is succesfully parsed. 
     */
    parse_comment(line) {
        // Parses comments from a single definition line, indicated by # // or '.
        line = line.trim();
        if ((line.length > 0) && (line.charAt(0) === '#')) {
            // Add comments to the array removing the first character.
            this.comments.push(line.slice(1));
            return true;
        } else if ((line.length > 1) && (line.charAt(0) === '/')) {
            // Add comments to the array removing the first two characters.
            this.comments.push(line.slice(2));
            return true;
        } else {
            return false;
        }
    }

    /**
     * Parses keywords  from a single definition line.
     * @param {String} line - The definition line to be parsed.
     * @param {Boolean} fromAscii - If true the source is ascii.
     * @param {Boolean} evaluate - If true the keyword is evaluated.
     * @returns {Object} - Returns the keywords found in the line. 
     */
    parse_keyword(line, fromAscii, evaluate) {
    }

    /**
     * Implements arbitrary line parsing, for item-specific requirements.
     * @param {String} line - The definition line to be parsed.
     */
    parse_line(line) {
    }

    /**
     * Reads a single variable from a single definition line.
.    * @param {String} line - The definition line to be parsed.
     * @return {Boolean} - Return true if the variabel is succesfully parsed. 
     */
    parse_variable(line) {
        // Reads a single variable from a single definition line.
        if (this.parse_comment(line)) {
            return true;
        } else {
            var cmd, args, kwargs;
            // Split the single line into a set of tokens.
            [cmd, args, kwargs] = this._runner._syntax.parse_cmd(line);
            if (cmd === 'set'){
                if (args.length !== 2) {
                    this._runner._debugger.addError('Failed to parse definition: ' + line);
                } else {
                    this.vars.set(args[0], args[1]);
                    return true;
                }
            } else {
                return false;
            }
        }
    }

    /**
     * Parses the item from a definition string.
.    * @param {String} script - The definition script line to be parsed.
     */
    from_string(script) {
        // Parses the item from a definition string.
        this.variables = {};
        this.comments = [];
        this.reset();

        // Split the string into an array of lines.  
        if (script !== null) {
            var lines = script.split('\n');
            for (var i = 0; i < lines.length; i++) {
                if ((lines[i] !== '') && (this.parse_variable(lines[i]) === false)){
                    this.parse_line(lines[i]);
                }
            }
        }
    }

    /** Implements the reset item variables method. */
    reset() {
    }

    /** Implements the prepeare phase of an item. */
    prepare() {
        // Set the internal counter.
        this.experiment.vars.set('count_' + this.name, this.count);
        this.count++;

        // Set the status to initialize.
        this._status = constants.STATUS_INITIALIZE;

        // For debugging.
        this._runner._debugger.addMessage('prepare ' + this.name);

        // Implements the complete phase of the item (to support blocking script in the prepare phase).
        if ((this.type === 'sequence') && (this._parent.type === 'sequence')) {
        } else {
            if ((this._parent !== null) && (this.type !== 'feedback')) {
                // Prepare cycle of parent.
                this._parent._prepare_complete();
            } 
        }    
    }

    /**
     * Set a onset time stamp before running an item.
     * @param {Number} time - The time to store as onset time.
     */
    set_item_onset(time) {
        // Set a timestamp for the item's executions
        time = (typeof time === 'undefined') ? this.clock.time() : time;
        
        // Add the time stamp to the variable list.
        this.experiment.vars.set('time_' + this.name, time);
    }

    /** Implements the run phase of an item. */
    run() {
        this._runner._debugger.addMessage('run ' + this.name);
    }
}
 