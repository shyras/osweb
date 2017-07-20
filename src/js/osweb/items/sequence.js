import Item from './item.js';
import Keyboard from '../backends/keyboard.js';
import { constants } from '../system/constants.js';

/**
 * Class representing a Sequence item. 
 * @extends Item
 */
export default class Sequence extends Item {
    /** The sequence class controls the running of a serie of items. */
    constructor(experiment, name, script) {
        // Inherited.
        super(experiment, name, script)     
    
        // Create and set private properties. 
        this._index = -1;
        this._items = null;
        this._keyboard = null;

        // Create and set public properties. 
        this.description = 'Runs a number of items in sequence';
        this.flush_keyboard = 'yes';
        this.items = null;

        // Process the script.
        this.from_string(script);
    }    

    /** Implements the complete phase of an item. */
    _complete() {
        // sequence is finalized.
        this._status = constants.STATUS_FINALIZE;

        // Inherited.	
        super._complete();
    }

    /** Implements the prepare complete phase of an item. */
    _prepare_complete() {
        // Generate the items list for the run cycle.
        if (this._index < this.items.length) {
            if ((this.items[this._index].item in this._runner._itemStore._items) === false) {
                this._runner._debugger.addError('Could not find a child item which is called by sequence item: ' + this.name + ' (' + this.items[this._index].item.name + ')');
            } else {
                // Increase the current index.
                this._index++;

                // Add the item to the internal list.
                this._items.push({
                    'item': this.items[this._index - 1].item,
                    'cond': this.syntax.compile_cond(this.items[this._index - 1].cond) 
                });

                // Prepare the item.
                this._runner._itemStore.prepare(this.items[this._index - 1].item, this);
            }
        } else {
            // Prepare process is done, start execution.
            this._index = 0;

            // Remove the prepare phase form the stack.    
            this._runner._itemStack.pop();

            // Check if this secuence is part of a parent sequence and must jump back in the prepare phase.
            if (this._parent.type === 'sequence') {
                this._parent._prepare_complete();
            } else {
                // Execute the next cycle of the sequnce itself.
                this._runner._itemStore.run(this.name, this._parent);
            }
        }
    }

    /** Reset all item variables to their default value. */
    reset() {
        this.items = [];
        this.vars.flush_keyboard = 'yes';
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
                    if ((tokens.length > 0) && (tokens[0] === 'run')) {
                        var item = tokens[1];
                        var cond = 'always';
                        if (tokens.length > 2) {
                            cond = tokens[2];
                        }
                        // Push the item and condition definition to the items list.
                        this.items.push({
                            'item': item,
                            'cond': cond
                        });
                    }
                }
            }
        }
    }

    /** Implements the prepare phase of an item. */
    prepare() {
        // Inherited.	
        super.prepare();

        // Create a keyboard to flush responses at the start of the run phase
        if (this.vars.flush_keyboard === 'yes') {
            this._keyboard = new Keyboard(this.experiment);
        } else {
            this._keyboard = null;
        }

        // Generate the items list for the run cycle.
        this._index = 0;
        this._items = [];

        // Prepare the items.
        this._prepare_complete();
    }

    /** Implements the run phase of an item. */
    run() {
        // Inherited.	
        super.run();

        // Check if all items have been processed.
        if (this._index < this._items.length) {
            // Flush the keyboard at the beginning of the sequence.
            if ((this._index == 0) && (this.vars.flush_keyboard === 'yes')) {
                this._keyboard.flush();
            }

            // Increase the current index.
            this._index++;
            var current_item = this._items[this._index - 1]

            // Set the workspace.
            this._runner._pythonWorkspace['self'] = this;

            // Check if the item may run.  
            if (this._runner._pythonWorkspace._eval(current_item.cond) === true) {
                // run the current item of the sequence object.
                this._runner._itemStore.run(current_item.item, this);
            } else {
                // Execute the next cycle of the sequnce itself.
                this.run();
            }
        } else {
            // sequence is finalized.
            this._complete();
        }
    }
}
 