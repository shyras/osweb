import { isNumber }  from 'underscore';
import Item from './item.js';
import Keyboard from '../backends/keyboard.js';
import { constants } from '../system/constants.js';

/**
 * Class representing a sequence item.
 * @extends Item
 */
export default class Loop extends Item {
    /**
     * Create an experiment item which controls the OpenSesame experiment.
     * @param {Object} experiment - The experiment item to which the item belongs.
     * @param {String} name - The unique name of the item.
     * @param {String} script - The script containing the properties of the item.
     */
    constructor(experiment, name, script) {
        // Inherited create.
        super(experiment, name, script);

        // Definition of public properties. 
        this.description = 'Repeatedly runs another item';
        this.matrix = null;

        // Definition of private properties. 
        this._break_if = '';
        this._cycles = [];
        this._index = -1;
        this._keyboard = null;
 
        // Process the script.
        this.from_string(script);
    }

    /** Implements the complete phase of an item. */
    _complete() {
        // Check if if the cycle must be repeated.
        if (this.experiment.vars.repeat_cycle == 1) {
            this.experiment._runner._debugger.msg('Repeating cycle: ' + this._index);

            this._cycles.push(this._index);

            if (this.vars.order === 'random') {
                this.shuffle(this._cycles);
            }
        } else {
            // All items are processed, set the status to finalized.
            this._status = constants.STATUS_FINALIZE;

            // Inherited.	
            super._complete();
        }
    }

    /** Reset all item variables to their default value. */
    reset() {
        this.matrix = {};
        this.vars.cycles = 1;
        this.vars.repeat = 1;
        this.vars.skip = 0;
        this.vars.offset = 'no';
        this.vars.order = 'random';
        this.vars.item = '';
        this.vars.break_if = 'never';
    }

    /**
     * Parse a definition string and retrieve all properties of the item.
     * @param {String} script - The script containing the properties of the item.
     */
    from_string(script) {
        // Creates a loop from a definition in a string.
        this.comments = [];
        this.variables = {};
        this.reset();

        // Split the string into an array of lines.  
        if (script != null) {
            var lines = script.split('\n');
            for (var i = 0; i < lines.length; i++) {
                if ((lines[i] !== '') && (this.parse_variable(lines[i]) === false)) {
                    var tokens = this.syntax.split(lines[i]);
                    if ((tokens[0] === 'run') && (tokens.length > 1)) {
                        this.vars.item = tokens[1];
                    } else if ((tokens[0] === 'setcycle') && (tokens.length > 3)) {
                        var cycle = tokens[1];
                        var name = tokens[2];
                        var value = this.syntax.remove_quotes(tokens[3]);

                        console.log('>>'+ cycle);    

                        // Check if the value is numeric
                        value = isNumber(value) ? Number(value) : value;

                        // Convert the python expression to javascript.
                        if (value[0] === '=') {
                            // Parse the python statement. 
                            value = this.experiment._runner._pythonParser._prepare(value.slice(1));

                            if (value !== null) {
                                value = value.body[0];
                            }
                        }

                        if (this.matrix[cycle] == undefined) {
                            this.matrix[cycle] = {};
                        }

                        this.matrix[cycle][name] = value;
                    }
                }
            }
        }
    }
 
    /**
     * Shuffles a array in ramdom order.
     * @param {Array} list -The array to shffle.
     */
    shuffle(list) {
        var i, j, t;
        for (i = 1; i < list.length; i++) {
            j = Math.floor(Math.random() * (1 + i));
            if (j != i) {
                t = list[i];
                list[i] = list[j];
                list[j] = t;
            }
        }
    }

    /**
     * Prepares the variables for one single cycle within the loop.
     * @param {Number} cycle -The cycle to apply.
     */
    apply_cycle(cycle) {
        // Sets all the loop variables according to the cycle.
        if (cycle in this.matrix) {
            for (var variable in this.matrix[cycle]) {
                // Get the value of the variable.
                var value = this.matrix[cycle][variable];

                // Check for python expression.
                if (typeof value === 'object') {
                    // value contains ast tree, run the parser.
                    try {
                        // Evaluate the expression
                        value = this.experiment._runner._pythonParser._runstatement(value);
                    } catch (e) {
                        // Error during evaluation.
                        this.experiment._runner._debugger.addError('Failed to evaluate experssion in in loop item: ' + this.name + ' (' + value + ')');
                    }
                }

                // Set the variable.
                this.experiment.vars.set(variable, value);
            }
        }
    }

    /** Implements the prepare phase of an item. */
    prepare() {
        // Prepare the break if condition.
        if ((this.vars.break_if !== '') && (this.vars.break_if !== 'never')) {
            this._break_if = this.syntax.compile_cond(this.vars.break_if);
        } else {
            this._break_if = null;
        }

        //  First generate a list of cycle numbers
        this._cycles = [];
        this._index = 0;

        // Walk through all complete repeats
        var whole_repeats = Math.floor(this.vars.repeat);
        for (var j = 0; j < whole_repeats; j++) {
            for (var i = 0; i < this.vars.cycles; i++) {
                this._cycles.push(i);
            }
        }

        // Add the leftover repeats.
        var partial_repeats = this.vars.repeat - whole_repeats;
        if (partial_repeats > 0) {
            var all_cycles = Array.apply(null, {
                length: this.vars.cycles
            }).map(Number.call, Number);
            var remainder = Math.floor(this.vars.cycles * partial_repeats);
            for (var i = 0; i < remainder; i++) {
                // Calculate random position.
                var position = Math.floor(Math.random() * all_cycles.length);
                // Add position to cycles.
                this._cycles.push(position);
                // Remove position from array.
                all_cycles.splice(position, 1);
            }
        }

        // Randomize the list if necessary.
        if (this.vars.order === 'random') {
            this.shuffle(this._cycles);
        } else {
            // In sequential order, the offset and the skip are relevant.
            if (this._cycles.length < this.vars.skip) {
                this.experiment._runner._debugger.addError('The value of skip is too high in loop item. You cannot skip more cycles than there are in: ' + this.name);
            } else {
                if (this.vars.offset === 'yes') {
                    // Get the skip elements.
                    var skip = this._cycles.slice(0, this.vars.skip);

                    // Remove the skip elements from the original location.
                    this._cycles = this._cycles.slice(this.vars.skip);

                    // Add the skip element to the end.
                    this._cycles = this._cycles.concat(skip);
                } else {
                    this._cycles = this._cycles.slice(this.vars.skip);
                }
            }
        }

        // Create a keyboard to flush responses between cycles.
        this._keyboard = new Keyboard(this.experiment);

        // Make sure the item to run exists.
        if (this.experiment.items._items[this.vars.item] === 'undefined') {
            this.experiment._runner._debugger.addError('Could not find an item which is called by loop item: ' + this.name + ' (' + this.vars.item + ')');
        }

        // Inherited.	
        super.prepare();

        // Set the onset time.
        this.set_item_onset();
    }
    
    /** Implements the run phase of an item. */
    run() {
        // Inherited.	
        super.run();

        if (this._cycles.length > 0) {
            var exit = false;
            this._index = this._cycles.shift();
            this.apply_cycle(this._index);
        
            // Check the break_if flag.
            if (this._break_if !== null) {
                this.python_workspace['this'] = this;

                var break_if = this.syntax.eval_text(this._break_if, null, true);

                if (this.python_workspace._eval(break_if) === true) {
                    exit = true;
                }
            }

            // Check the exit status.
            if (exit === false) {
                this.experiment.vars.repeat_cycle = 0;
                this.experiment._runner._itemStore.prepare(this.vars.item, this);
            } else {
                // Break the loop.
                this._complete();
            }
        } else {
            // Break the loop.
            this._complete();
        }
    }
}
