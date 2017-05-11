import Item from './item.js';
import { constants } from '../system/constants.js';

/**
 * Class representing a logger item.
 * @extends Item
 */
export default class Logger extends Item {
    /**
     * Create an experiment item which controls the OpenSesame experiment.
     * @param {Object} pExperiment - The experiment item to which the item belongs.
     * @param {String} pName - The unique name of the item.
     * @param {String} pScript - The script containing the properties of the item.
     */
    constructor(experiment, name, script) {
        // Inherited create.
        super(experiment, name, script);

        // Definition of public properties. 
        this.description = 'Logs experimental data';
        this.logvars = [];

        // Definition of private properties. 
        this._logvars = null;
   
        // Process the script.
        this.from_string(script);
    }

    /** Implements the complete phase of an item. */
    _complete() {
        // Inherited.	
        super._complete();
    }

    /** Reset all item variables to their default value. */
    reset() {
        this._logvars = null;
        this.logvars = [];
        this.vars.auto_log = 'yes';
    }

    /**
     * Parse a definition string and retrieve all properties of the item.
     * @param {String} script - The script containing the properties of the item.
     */
    from_string(script) {
        // Parses a definition string.
        this.variables = {};
        this.comments = [];
        this.reset();

        // Split the string into an array of lines.  
        if (script !== null) {
            var lines = script.split('\n');
            for (var i = 0; i < lines.length; i++) {
                if ((lines[i] !== '') && (this.parse_variable(lines[i]) === false)) {
                    var tokens = this.syntax.split(lines[i]);
                    if ((tokens[0] === 'log') && (tokens.length > 0)) {
                        this.logvars.push(tokens[1]);
                    }
                }
            }
        }
    }

    /** Implements the run phase of an item. */
    run() {
        // Inherited.	
        super.run();

        // Run item only one time.   
        if (this._status !== constants.STATUS_FINALIZE) {
            // item is finalized.
            this._status = constants.STATUS_FINALIZE;

            this.set_item_onset();
            if (this._logvars == null) {
                if (this.vars.auto_log === 'yes') {
                    this._logvars = this.experiment._log._get_all_vars();
                } else {
                    this._logvars = [];
                    for (variable in this.logvars) {
                        if ((variable in this._logvars) === false) {
                            this._logvars.push(variable);
                        }
                    }
                    this._logvars.sort();
                }
            }
            this.experiment._log.write_vars(this._logvars);

            // Complete the cycle.
            this._complete();
        }
    }
}
