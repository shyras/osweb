/*
 * Definition of the class loop.
 */

module.exports = function(osweb){
    function loop(pExperiment, pName, pScript) {
        // Inherited create.
        this.item_constructor(pExperiment, pName, pScript);

        // Definition of private properties. 
        this._break_if = '';
        this._cycles = [];
        this._index = -1;
        this._keyboard = null;
    };

    // Extend the class from its base class.
    var p = osweb.extendClass(loop, osweb.item);

    // Definition of public properties. 
    p.description = 'Repeatedly runs another item';
    p.matrix = null;

    /*
     * Definition of public methods - building cycle.         
     */

    p.reset = function() {
        // Resets all item variables to their default value.
        this.matrix = {};
        this.vars.cycles = 1;
        this.vars.repeat = 1;
        this.vars.skip = 0;
        this.vars.offset = 'no';
        this.vars.order = 'random';
        this.vars.item = '';
        this.vars.break_if = 'never';
    };

    p.from_string = function(pString) {
        // Creates a loop from a definition in a string.
        this.comments = [];
        this.variables = {};
        this.reset();

        // Split the string into an array of lines.  
        if (pString != null) {
            var lines = pString.split('\n');
            for (var i = 0; i < lines.length; i++) {
                if ((lines[i] != '') && (this.parse_variable(lines[i]) == false)) {
                    var tokens = osweb.syntax.split(lines[i]);
                    if ((tokens[0] == 'run') && (tokens.length > 1)) {
                        this.vars.item = tokens[1];
                    } else if ((tokens[0] == 'setcycle') && (tokens.length > 3)) {
                        var cycle = tokens[1];
                        var name = tokens[2];
                        var value = osweb.syntax.remove_quotes(tokens[3]);

                        // Check if the value is numeric
                        value = osweb.syntax.isNumber(value) ? Number(value) : value;

                        // Convert the python expression to javascript.
                        if (value[0] == '=') {
                            // Parse the python statement. 
                            value = osweb.parser._prepare(value.slice(1));

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
    };

    /*
     * Definition of public methods - runn cycle.         
     */

    p.shuffle = function(list) {
        var i, j, t;
        for (i = 1; i < list.length; i++) {
            j = Math.floor(Math.random() * (1 + i));
            if (j != i) {
                t = list[i];
                list[i] = list[j];
                list[j] = t;
            }
        }
    };

    p.apply_cycle = function(cycle) {
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
                        value = osweb.parser._runstatement(value);
                    } catch (e) {
                        // Error during evaluation.
                        osweb.debug.addError('Failed to evaluate ' + value + ' in loop item ' + this.name);
                    }
                }

                // Set the variable.
                this.experiment.vars.set(variable, value);
            }
        }
    };

    p.prepare = function() {
        // Prepare the break if condition.
        if ((this.vars.break_if != '') && (this.vars.break_if != 'never')) {
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
        if (this.vars.order == 'random') {
            this.shuffle(this._cycles);
        } else {
            // In sequential order, the offset and the skip are relevant.
            if (this._cycles.length < this.vars.skip) {
                osweb.debug.addError('The value of skip is too high in loop item ' + this.name + '. You cannot skip more cycles than there are.');
            } else {
                if (this.vars.offset == 'yes') {
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
        this._keyboard = new osweb.keyboard(this.experiment);

        // Make sure the item to run exists.
        if (this.experiment.items._items[this.vars.item] === 'undefined') {
            osweb.debug.addError('Could not find item ' + this.vars.item + ', which is called by loop item ' + this.name);
        }

        // Inherited.	
        this.item_prepare();

        // Set the onset time.
        this.set_item_onset();
    };

    p.run = function() {
        // Inherited.	
        this.item_run();

        if (this._cycles.length > 0) {
            var exit = false;
            this._index = this._cycles.shift();
            this.apply_cycle(this._index);

            if (this._break_if != null) {
                this.python_workspace['this'] = this;

                var break_if = osweb.syntax.eval_text(this._break_if);

                if (this.python_workspace._eval(break_if) == true) {
                    exit = true;
                }
            }

            if (exit == false) {
                this.experiment.vars.repeat_cycle = 0;

                osweb.item_store.prepare(this.vars.item, this);
                //osweb.item_store.execute(this.vars.item, this);
            } else {
                // Break the loop.
                this.complete();
            }
        } else {
            // Break the loop.
            this.complete();
        }
    };

    p.complete = function() {
        // Check if if the cycle must be repeated.
        if (this.experiment.vars.repeat_cycle == 1) {
            osweb.debug.msg('repeating cycle ' + this._index);

            this._cycles.push(this._index);

            if (this.vars.order == 'random') {
                this.shuffle(this._cycles);
            }
        } else {
            // All items are processed, set the status to finalized.
            this._status = osweb.constants.STATUS_FINALIZE;

            // Inherited.	
            this.item_complete();
        }
    };

    // Bind the loop class to the osweb namespace.
    return osweb.promoteClass(loop, "item");
}