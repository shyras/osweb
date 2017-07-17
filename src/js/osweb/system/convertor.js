import { isNumber }  from 'underscore';

/** Class representing a convertor. */
export default class Convertor {
    /**
     * Create a convertor which converts an osexp script to a JSON object stucture.
     * @param {Object} runner - The runner class to which the debugger belongs.
     */
    constructor(runner) {
        // Create and set private properties. 
        this.item = null; // Current item to process. 
        this.runner = runner; // Parent runner attached to the debugger.    
        this.variable = null; // Container for global multiline variable.
        this.variabelName = ''; // Name of a global multiline variable.
    }

    /**
     * Strip additional quotes for value token.
     * @param {String} value - The value to check and (optional) convert.
     * @return {String} - The converted value.
     */
    parseValue(value) {
        // Strip additional quotes.
        if ((value.length >= 4) && (value.substr(0,1) === '"') && (value.substr(value.length - 1,1) === '"')) {
            return value.substr(1, value.length - 2);
        } else {
            return value;    
        }    
    }

    /**
     * Process a single line within the osexp script. 
     * @param {String} line - The string line to parse.
     */
    parseLine(line) {
        // Split a line into items and process them.
        var items = line.match(/(".*?"|[^"\s]+)+(?=\s*|\s*$)/g);
        
        // if defined process a single line.
        if (items !== null) {
            // Select action on first token.
            switch (items[0]) {
                case 'define':
                    //Process a define statement.
                    this.item = this.runner._itemStore.newItem(items[1], items[2], ''); 
                    break;
                case 'draw':
                    // Create the element.
                    var element = this.runner._itemStore._newElementClass(items[1], this.item, '');
                    
                    // Split the properties and process them.
                    for (var i = 2; i < items.length; i++) {
                        var pair = items[i].split('=', 2);
                        element.properties[pair[0]] = pair[1];
                    }    

                    // Add the element to the item.
                    this.item.elements.push(element);    
                    break;
                case 'run':
                    if (this.item.type === 'sequence') {
                        // Process a run statement for a sequence item.
                        this.item.items.push({
                            'item': items[1],
                            'cond': items[2]
                        });
                    } else {
                        // Process a run statement for a loop item.
                        this.item.vars.item = items[1];                        
                    }
                    break;
                case 'set':
                    // Process a set statement.
                    this.item.vars[items[1]] = this.parseValue(items[2]);
                    break;
                case 'setcycle':
                    // Process a setcycle statement.
                    var value = this.parseValue(items[3]);

                    // Convert the python expression to javascript.
                    if (value[0] === '=') {
                        // Parse the python statement. 
                        value = this.runner._pythonParser._prepare(value.slice(1));
                        if (value !== null) {
                            value = value.body[0];
                        }
                    } else {
                        // Check if the value is numeric
                        value = isNumber(value) ? Number(value) : value;
                    }
                    
                    // Set the matrix with the proper values.
                    if (this.item.matrix[items[1]] == undefined) {
                        this.item.matrix[items[1]] = {};
                    }
                    this.item.matrix[items[1]][items[2]] = value;
                    break;
                case 'widget':
                    // Remove the widget token from the list.
                    items.shift();

                    // Add the element to the item.
                    this.item._widgets.push(items);    
                    break;
                default:    
                    // check for multiline variables.
                    if ((items[0].length > 5) && (items[0].substr(0,2) === '__') && (items[0].substr(-2) === '__')) {
                        // Start of end of the multiline variable.
                        if (items[0] === '__end__') {
                            this.item.vars[this.variableName] = this.variable;
                            this.variable = null;
                        } else {
                            this.variableName = items[0].substr(2, items[0].length - 4);                           
                            this.variable = [];
                        } 
                    } else {
                        if (this.variable !== null) {
                            this.variable.push(line);
                        }
                    }        
            }
        } else {
            if (this.variable !== null) {
                this.variable.push('');
            } else {
                // Return to default level.
                this.item = this.runner._experiment;        
            }
        }
    }    

    /** Initialize the debugger object class. */
    parseScript(script) {
        // Set first item.
        this.item = this.runner._experiment;

        // Split the script into lines.
        if (script !== null) {
            // Split the script into lines.
            var lines = script.split('\n');
            for (var i = 0; i < lines.length; i++) {
                // Parse a single line
                this.parseLine(lines[i]);
            }        
        }
    }
}    