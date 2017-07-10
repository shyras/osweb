import filbert from 'filbert';
import PythonMath from './python_math.js';
import PythonOpenSesame from './python_opensesame.js';
import PythonRandom from './python_random.js';
import PythonString from './python_string.js';

/** Class implementing a python AST interpreter. */
export default class PythonParser {
    /**
     * Create a python AST runner.
     * @param {Object} runner - The runner to which the AST object belongs.
     */
    constructor(runner) {
        // Set class parameter properties.
        this._runner = runner; // Parent runner attached to the AST object.

        // Set class properties.
        this.python_math = new PythonMath(this._runner);
        this.python_opensesame = new PythonOpenSesame(this._runner);
        this.python_random = new PythonRandom(this._runner);
        this.python_string = new PythonString(this._runner);

        // Definition of private properties.
        this._classes = {}; // Accessible classes within the script code.
        this._function_stack = []; // Function call stack.   
        this._global_return_value = null; // Global return value for blocking calls.
        this._inline_script = null; // Parent inline_script item.
        this._node = null; // Current active node.  
        this._onConsole = null;
        this._stack = 0; // Stack counter (hack to precent stack overflow).
        this._statement = null; // process one statement or an script.
        this._status = 0; // Status of the walker.
        this._variables = {}; // Object containing all global objects and variables. 
    }

    /** Initialization phase of the python class. */
    _initialize() {
        // Set the python variable connections with opensesame.  
        this._variables['clock'] = this._runner._experiment.clock;
        this._variables['exp'] = this._runner._experiment;
        this._variables['items'] = this._runner._itemStore;
        this._variables['pool'] = this._runner._pool;
        this._variables['var'] = this._runner._experiment.vars;

        // Set the console handler.
        if (this._runner._onConsole !== null) {
            this._onConsole = this._runner._onConsole; 
        }
        
        // Initialize internal libraries to the interpreter.
        this.python_math._initialize();
        this.python_opensesame._initialize();
        this.python_random._initialize();
        this.python_string._initialize();
    }

    /**
     * Create a python AST runner.
     * @param {String} script - Parse a python script using the filbert library.
     */
    _parse(script) {
        // Check if the script exists.
        if (script != '""') {
            var locations = false;
            var parseFn = filbert.parse;
            var ranges = false;

            // Try to parse the script.
            try {
                var code = script;
                var ast = parseFn(code, {
                    locations: locations,
                    ranges: ranges});
                return ast;
            } catch (e) {
                this._runner._debugger.addError('Script parsing error: ' + e.message);
                return null;
            }
        } else {
            return null;
        } 
    }

    /**
     * Get the context part of a identifier (before the dot '.').
     * @param {String} identifier - Full name of the identifier.
     */
    _get_context(identifier) {
        // Split the identifer
        var items = identifier.value.split('.');

        if ((items[0] === '__pythonRuntime') && (items[1] === 'imports')) {
            return this._variables[items[2]];
        } else {
            // Return the object context
            if (this._variables[items[0]] !== undefined) {
                return this._variables[items[0]];
            } else {
                return window[items[0]];
            }
        }     
    }

    /**
     * Get an element form a library of the variable container.
     * @param {String} element - Full name of the element to retrieve.
     * @return {Object} - The given element found in the context.
     */
    _get_element(element) {
        // Split the identifier name space.
        var items = element.value.split('.');

        // Check if the identifier is part of the internal scope.
        if (items[0] === '__pythonRuntime') {
            // Check if the identifier is part of the import scope. 
            if (items[1] === 'imports') {
                var import_lib = filbert.pythonRuntime.imports[items[2]];
                return import_lib[items[3]];
            } else {
                var default_lib = filbert.pythonRuntime[items[1]];
                 return default_lib[items[2]];
            }    
        } else {
            // No internal scope, check if it is defined in the global scope
            if (this._variables[items[0]] !== undefined) {
                if (items.length === 1) {
                    return this._variables[items[0]];
                } else {
                    return this._variables[items[0]][items[1]];
                }
            } else {
                if (window[items[0]] !== undefined) {
                    if (items.length === 1) {
                        return window[items[0]];
                    } else {
                        return window[items[0]][items[1]];
                    }
                }    
            }
        }
    }    

    /**
     * Get the value of an element form a library of the variable container.
     * @param {String} element - Full name of the element to retrieve.
     * @return {Boolean|Number|Object|String} - The value of the given element.
     */
    _get_element_value(element) {
        switch (element.type) {
            case 'identifier':
                    // Split the identifier name space.
                    var items = element.value.split('.');

                    // Set the element value in the global scope.
                    if (items.length === 1) {
                        if (this._variables[items[0]] !== undefined) {
                            return this._variables[items[0]];
                        } else {
                            return window[items[0]];
                        }    
                    } else {
                        if (items[0].indexOf('__filbertRight') !== -1) {
                            if (items[1].indexOf('__filbertIndex') !== -1) {
                                var container = this._variables[items[0]];
                                var index = this._variables[items[1]];
                                return container[index];
                            } else { 
                                if (this._variables[items[0]] !== undefined) {
                                    return this._variables[items[0]][items[1]];
                                } else {
                                    return window[items[0]][items[1]];
                                }
                            } 
                        } else if (items[0] === '__pythonRuntime') {
                            if (items[1] === 'imports') {
                                var import_lib = filbert.pythonRuntime.imports[items[2]];
                                return import_lib[items[3]];
                            } else {
                                var default_lib = filbert.pythonRuntime[items[1]];
                                return default_lib[items[2]];
                            }    
                        } else {
                            if (this._variables[items[0]] !== undefined) {
                                return this._variables[items[0]][items[1]];
                            } else {
                                return window[items[0]][items[1]];
                            }
                        } 
                    }
                break;
            case 'literal':
                    // return the value of the literal.
                    return element.value;
                break;
        }        
    }    
    
    /**
     * Set the value of an element.
     * @param {String} element - Full name of the element to set.
     * @param {Boolean|Number|Object|String} value - The value for the given element.
     */
    _set_element_value(element, value) {
        // Split the identifier name space.
        var items = element.value.split('.');
        
        // Set the element value in the global scope.
        if (items.length === 1) {
            if (window[items[0]] !== undefined) {
                window[items[0]] = value; 
            } else {
                this._variables[items[0]] = value; 
            }
        } else {
            if (window[items[0]] !== undefined) {
                window[items[0]][items[1]] = value;
            } else {
                this._variables[items[0]][items[1]] = value;
            }
        }
    }

    /**
     * Set the given node to the current node.
     * @param {Object} node - The node to set as current node.
     */
    _set_node(node) {
        // Set the current node as the parent node
        node.parent = this._node;
        
        // Set the new node as the current node.
        this._node = node;
    }
    
    /**
     * Set the return value of a node.
     * @param {Boolean|Number|Object|String} value - The return value for the processed node.
     */
    _set_return_value(value) {
        // Create or acces the return_values array.
        this._node.parent.return_values = (typeof this._node.parent.return_values === 'undefined') ? [] : this._node.parent.return_values;

        // Push the value. 
        this._node.parent.return_values.push(value);
    }

    /** Process an AST array expression. */
    _array_expression() {
        // Initialize node specific properties.
        this._node.index = (typeof this._node.index === 'undefined') ? 0 : this._node.index;

        // Check if all nodes in script have been processed.
        if (this._node.index < this._node.elements.length) {
            // Set current node to node in body.
            this._node.index++;
            this._set_node(this._node.elements[this._node.index - 1]);
                    
            // Return to the processor.
            this._process_nodes();
        } else {
            // Redefine the return values.
            for (var i = 0; i < this._node.return_values.length; i++) {
                this._node.return_values[i] = this._get_element_value(this._node.return_values[i]);
            }
            var return_value = {type: 'literal', value: this._node.return_values};
            
            // Set the return value.
            this._set_return_value(return_value);
    
            // Reset node index and return to the parent node.
            this._node.index = 0;
            this._node.return_values = [];
            this._node = this._node.parent;
            this._process_nodes();
        }    
    }

    /** Process an AST assignment expression. */
    _assignment_expression() {
        // Initialize node specific properties.
        this._node.status = (typeof this._node.status === 'undefined') ? 0 : this._node.status;

        // Process the current status.
        switch (this._node.status) {
            case 0:
                // process id.
                this._node.status = 1;
                this._set_node(this._node.left);

                // Return to the processor.
                this._process_nodes();
                break;
            case 1:
                // Process init.
                this._node.status = 2;
                this._set_node(this._node.right);

                // Return to the processor.
                this._process_nodes();
                break;
            case 2:
                // define variables
                var tmp_value; 
                        
                // Select binary operator.
                switch (this._node.operator) {
                    case '=': 
                        // Process the init value.
                        this._set_element_value(this._node.return_values[0], this._get_element_value(this._node.return_values[1]));
                        break;    
                    case '-=': 
                        tmp_value = this._get_element_value(this._node.return_values[0]);
                        this._set_element_value(this._node.return_values[0], tmp_value - this._get_element_value(this._node.return_values[1]));
                        break;    
                    case '/=': 
                        tmp_value = this._get_element_value(this._node.return_values[0]);
                        this._set_element_value(this._node.return_values[0], tmp_value / this._get_element_value(this._node.return_values[1]));
                        break;    
                    case '%=': 
                        tmp_value = this._get_element_value(this._node.return_values[0]);
                        this._set_element_value(this._node.return_values[0], tmp_value % this._get_element_value(this._node.return_values[1]));
                        break;    
                }
        
                // Reset node index and return to the parent node.
                this._node.status = 0;
                this._node.return_values = [];
                this._node = this._node.parent;
                this._process_nodes();
                break;
        }    
    }

    /** Process an AST binary expression. */
    _binary_expression() {
         // Initialize status property.
        this._node.status = (typeof this._node.status === 'undefined') ? 0 : this._node.status;

        // Process the current status.
        switch (this._node.status) {
            case 0:
                // Process object.
                this._node.status = 1;
                this._set_node(this._node.left);

                // Return to the node processor.
                this._process_nodes();
                break;
            case 1:
                // Process property
                this._node.status = 2;
                this._set_node(this._node.right);

                // Return to the node processor.
                this._process_nodes();
                break;
            case 2:
                // define variables.
                var left = this._get_element_value(this._node.return_values[0]);
                var right = this._get_element_value(this._node.return_values[1]);
                var return_value = {type: 'literal'};
                 
                // Select binary operator.
                switch (this._node.operator) {
                    case '-':
                        return_value.value = left - right;
                        break;
                    case '/':
                        return_value.value = left / right;
                        break;
                    case '==':
                        return_value.value = (left === right);
                        break;
                    case '!=':
                        return_value.value = (left !== right);
                        break;
                    case '>':
                        return_value.value = (left > right);
                        break;
                    case '<':
                        return_value.value = (left < right);
                        break;
                    case '>=':
                        return_value.value = (left >= right);
                        break;
                    case '<=':
                        return_value.value = (left <= right);
                        break;
                    case '%': 
                        if ((typeof left === 'number') && (typeof right === 'number')) {
                            return_value.value = left % right;
                        } else {
                            return_value.value = left.replace(/%s/g, right);
                        }
                        break;
                    case 'instanceof':
                        return_value.value = left instanceof right;
                        break;
                }
            
                // Set the return value.
                this._set_return_value(return_value);
    
                // Reset node index and return to the parent node.
                this._node.status = 0;
                this._node.return_values = [];
                this._node = this._node.parent;
                this._process_nodes();
                break;
        }    
    }

    /** Process an AST block statement. */
    _block_statement() {
        // Initialize node specific properties.
        this._node.break = (typeof this._node.break === 'undefined') ? false : this._node.break;
        this._node.index = (typeof this._node.index === 'undefined') ? 0 : this._node.index;

        // Check if all nodes in script have been processed.
        if ((this._node.index < this._node.body.length) && (this._node.break === false)) {
            // Set current node to node in body.
            this._node.index++;
            this._set_node(this._node.body[this._node.index - 1]);
                    
            // Return to the processor.
            this._process_nodes();
        } else {
            // Reset node index and return to the parent node.
            if (this._node.break === true) {
                this._node.break = false;
                this._node.parent.break = true;
            }
            
            this._node.index = 0;
            this._node = this._node.parent;
            this._process_nodes();
        }    
    }

    /** Process an AST break statement. */
    _break_statement() {
        // Set break flag for parent element.
        this._node.parent.break = true; 
        
        // Return to the parent node.
        this._node = this._node.parent;
        this._process_nodes();
    }    

    /** Process an AST call expression. */
    _call_expression() {
        // Initialize status properties.
        this._node.arguments = (typeof this._node.arguments === 'undefined') ? [] : this._node.arguments;
        this._node.index = (typeof this._node.index === 'undefined') ? 0 : this._node.index;
        this._node.status = (typeof this._node.status === 'undefined') ? 0 : this._node.status;
        
        // Process the current status.
        switch (this._node.status) {
            case 0:
                // Process arguments and caller.
                if (this._node.index < this._node.arguments.length) {
                    // Set current node to next node in list.
                    this._node.index++;
                    this._set_node(this._node.arguments[this._node.index - 1]);

                    // Return to the node processessor.
                    this._process_nodes();
                } else {
                    // Set parent node.
                    this._node.status = 1;
                    this._set_node(this._node.callee);

                    // Return to the node processor.
                    this._process_nodes();
                }
                break;
            case 1:    
                // Get the first return value, which is the name of the caller element.
                var return_value = this._node.return_values.pop();

                // Get the arguments used on the caller element.
                var tmp_arguments = [];
                for (var i = 0; i < this._node.return_values.length; i++) {
                    tmp_arguments.push(this._get_element_value(this._node.return_values[i]));
                }

                var caller = this._get_element(return_value);    
                var context = this._get_context(return_value);
        
                if ((return_value.value === 'sleep') || (return_value.value === '__pythonRuntime.imports.clock.sleep')) {
                    // Adjust the status to special.
                    this._node.status = 2;
                
                    // Check the context.
                    if (typeof context === 'undefined') {
                        context = this;
                    } 

                    // Execute the blocking call.
                    caller.apply(context, tmp_arguments);
                } else {
                    // Check the context.
                    if (typeof context === 'undefined') {
                        context = this;
                    } 

                    // Execute the call, check first for internal function call.
                    if (this._node.callee.type === 'FunctionExpression') {
                        return_value = {type: 'literal', value: caller};
                    } else {
                        return_value = {type: 'literal', value: caller.apply(context, tmp_arguments)};
                    }

                    // Set the return value.
                    this._set_return_value(return_value);

                    // Reset node index and return to the parent node.
                    this._node.index = 0;
                    this._node.status = 0;
                    this._node.return_values = [];
                    this._node = this._node.parent;
                    this._process_nodes();
                }
                break;
            case 2:
                // Special state used when calling a blocking method (sleep, clock.sleep, keyboard.get_key(), mouse.get_click).
                this._set_return_value(this.global_return_value);
                
                // Reset node index and return to the parent node.
                this._node.index = 0;
                this._node.status = 0;
                this._node.return_values = [];
                this._node = this._node.parent;
                this._process_nodes();
                break;
        }        
    }

    /** Process an AST empty statment. */
    _empty_statement() {
        // Set parent node.
        this._node = this._node.parent;

        // Return to the node processessor.
        this._process_nodes();
    }

    /** Process an AST expression statement. */
    _expression_statement() {
        // Initialize status property.
        this._node.status = (typeof this._node.status === 'undefined') ? 0 : this._node.status;

        // Process the current status.
        if (this._node.status === 0) {
            // Set parent node.
            this._node.status = 1;
            this._set_node(this._node.expression);

            // Return to the node processor.
            this._process_nodes();
        } else {
            // Set parent node.
            this._node.status = 0;
            this._node = this._node.parent;

            // Return to the node processessor.
            this._process_nodes();
        }
    }

    /** Process an AST for statement. */
    _for_statement() {
        // Initialize status property.
        this._node.status = (typeof this._node.status === 'undefined') ? 0 : this._node.status;
    
        // Process the current status.
        switch (this._node.status) {
            case 0:
                // Process object.
                this._node.status = 1;
                this._set_node(this._node.init);

                // Return to the node processessor.
                this._process_nodes();
                break;
            case 1:
                // Process object.
                this._node.status = 2;
                this._set_node(this._node.test);

                // Return to the node processessor.
                this._process_nodes();
                break;
            case 2:
                // Check if the test node has returned true.
                if  (this._node.return_values[0].value === true) {
                    // Process object.
                    this._node.status = 3;
                    this._node.return_values = [];
                    this._set_node(this._node.body);
                        
                    // Return to the node processessor.
                    this._process_nodes();
                } else {
                    // Range has ended.
                    this._node.status = 0;
                    this._node.return_values = [];
                    this._node = this._node.parent;

                    // Return to the node processessor.
                    this._process_nodes();
                }    
                break;
            case 3:
                // Process object.
                this._node.status = 1;
                this._set_node(this._node.update);

                // Return to the node processessor.
                this._process_nodes();
                break;
        }        
    }
    
    /** Process an AST for in statement. */
    _for_in_statement() {
        // Initialize status property.
        this._node.index = (typeof this._node.index === 'undefined') ? 0 : this._node.index;
        this._node.status = (typeof this._node.status === 'undefined') ? 0 : this._node.status;

        // Process the current status.
        switch (this._node.status) {
            case 0:
                // Process object.
                this._node.status = 1;
                this._set_node(this._node.left);

                // Return to the node processessor.
                this._process_nodes();
                break;
            case 1:
                // Process object.
                this._node.status = 2;
                this._set_node(this._node.right);

                // Return to the node processessor.
                this._process_nodes();
                break;
            case 2:
                // Retrieve the range on which the loop travels.
                var tmp_range = this._get_element_value(this._node.return_values[1]);
                
                // Execute the range.
                if (this._node.index < tmp_range.length) {
                    // Set the value of the range.
                    this._set_element_value(this._node.return_values[0],tmp_range[this._node.index]);
                    
                    // Increase the index.
                    this._node.index++;
                    
                    // Execute the body.
                    this._set_node(this._node.body);
                    this._process_nodes();
                } else {
                    this._node.index = 0;
                    this._node.status = 0;
                    this._node.return_values = [];
                    this._node = this._node.parent;
                    this._process_nodes();
                }
                break;
        }        
    }

    /** Process an AST function expression. */
    _function_expression() {
        // Initialize status property.
        this._node.status = (typeof this._node.status === 'undefined') ? 0 : this._node.status;

        // Process the current status.
        switch (this._node.status) {
            case 0:
                // Process defaults.
                this._node.status = 1;
                this._set_node(this._node.body);

                // Return to the node processor.
                this._process_nodes();
                break;
            case 1:
                // Remove the last return value from the global function stack.
                var return_value = this._function_stack.pop();

                // Set the return value
                this._set_return_value(return_value);
                
                // Set parent node.
                this._node.status = 0;
                this._node.return_values = [];
                this._node = this._node.parent;
                this._process_nodes();
                break;
        }        
    }    

    /** Process an AST identifier. */
    _identifier() {
        // Retrieve the identifier information.
        var return_value = {type: 'identifier', value: this._node.name};

        // Set the return value.
        this._set_return_value(return_value);

        // Set parent node.
        this._node = this._node.parent;
        this._process_nodes();
    }

    /** Process an AST if statement. */
    _if_statement() {
        // Initialize status property.
        this._node.break = (typeof this._node.break === 'undefined') ? false : this._node.break;
        this._node.status = (typeof this._node.status === 'undefined') ? 0 : this._node.status;

        // Process the current status.
        switch (this._node.status) {
            case 0:
                // Process object.
                this._node.status = 1;
                this._set_node(this._node.test);

                // Return to the node processor.
                this._process_nodes();
                break;
            case 1:
                // Check if expression is true.
                if (this._node.return_values[0].value === true) {
                    this._node.status = 2;
                    this._set_node(this._node.consequent);

                    // Return to the node processor.
                    this._process_nodes();
                } else if (this._node.alternate !== null) {
                    this._node.status = 2;
                    this._set_node(this._node.alternate);

                    // Return to the node processor.
                    this._process_nodes();
                } else {
                    this._node.status = 2;
                    this._process_nodes();
                }
                break;
            case 2:
                // Set parent node.
                if (this._node.break === true) {
                    this._node.break = false;
                    this._node.parent.break = true;
                }
                this._node.status = 0;
                this._node.return_values = [];
                this._node = this._node.parent;
                this._process_nodes();
                break;
        }        
    }

    /** Process an AST literal. */
    _literal() {
        // Retrieve the identifier information.
        var return_value = {type: 'literal', value: this._node.value};
        
        // Set the return value.
        this._set_return_value(return_value);

        // Set parent node.
        this._node = this._node.parent;
        this._process_nodes();
    }    

    /** Process an AST logical expression. */
    _logical_expression() {
         // Initialize status property.
        this._node.status = (typeof this._node.status === 'undefined') ? 0 : this._node.status;

        // Process the current status.
        switch (this._node.status) {
            case 0:
                // Process object.
                this._node.status = 1;
                this._set_node(this._node.left);

                // Return to the node processor.
                this._process_nodes();
                break;
            case 1:
                // Process property
                this._node.status = 2;
                this._set_node(this._node.right);

                // Return to the node processor.
                this._process_nodes();
                break;
            case 2:
                // define variables.
                var left = this._get_element_value(this._node.return_values[0]);
                var right = this._get_element_value(this._node.return_values[1]);
                var return_value = {type: 'literal'};
                 
                // Select binary operator.
                switch (this._node.operator) {
                    case '&&':
                        return_value.value = left && right;
                        break;
                    case '||':
                        return_value.value = left || right;
                        break;
                }
            
                // Set the return value.
                this._set_return_value(return_value);
    
                // Reset node index and return to the parent node.
                this._node.status = 0;
                this._node.return_values = [];
                this._node = this._node.parent;
                this._process_nodes();
                break;
        }    
    }

    /** Process an AST member expression */
    _member_expression() {
        // Initialize status property.
        this._node.status = (typeof this._node.status === 'undefined') ? 0 : this._node.status;

        // Process the current status.
        switch (this._node.status) {
            case 0:
                // Process object.
                this._node.status = 1;
                this._set_node(this._node.object);

                // Return to the node processessor.
                this._process_nodes();
                break;
            case 1:
                // Process property
                this._node.status = 2;
                this._set_node(this._node.property);

                // Return to the node processessor.
                this._process_nodes();
                break;
            case 2:
                // Build the combing return value.
                var return_value = {type: 'identifier', value: this._node.return_values[0].value + '.' + this._node.return_values[1].value};

                // Set the return value
                this._set_return_value(return_value);

                // Reset node index and return to the parent node.
                this._node.status = 0;
                this._node.return_values = [];
                this._node = this._node.parent;
                this._process_nodes();
                break;    
        }        
    }    
    
    /** Process an AST new expression. */
    _new_expression() {
        // Initialize status properties.
        this._node.arguments = (typeof this._node.arguments === 'undefined') ? [] : this._node.arguments;
        this._node.index = (typeof this._node.index === 'undefined') ? 0 : this._node.index;
        this._node.status = (typeof this._node.status === 'undefined') ? 0 : this._node.status;
     
           // Process the current status.
        if (this._node.status === 0) {
            // Process arguments and caller.
            if (this._node.index < this._node.arguments.length) {
                // Set current node to next node in list.
                this._node.index++;
                this._set_node(this._node.arguments[this._node.index - 1]);

                // Return to the node processessor.
                this._process_nodes();
            } else {
                // Set parent node.
                this._node.status = 1;
                this._set_node(this._node.callee);

                // Return to the node processor.
                this._process_nodes();
            }
        } else {
            // Get the caller and context element. 
            var return_value = this._node.return_values.pop();
            var caller = this._get_element(return_value);    
            var context = this._get_context(return_value);
        
            // Create the aruments array.
            var tmp_arguments = [];
            for (var i = 0; i < this._node.return_values.length; i++) {
                tmp_arguments.push(this._get_element_value(this._node.return_values[i]));
            }

            // Execute the call.
            var return_value = {type: 'literal', value: caller.apply(context, tmp_arguments)};

            // Set the return value
            this._set_return_value(return_value);

            // Reset node index and return to the parent node.
            this._node.index = 0;
            this._node.status = 0;
            this._node.return_values = [];
            this._node = this._node.parent;
            this._process_nodes();
        }
    }

    /** Process an AST program. */
    _program() {
        // Initialize node specific properties.
        this._node.index = (typeof this._node.index === 'undefined') ? 0 : this._node.index;

        // Check if all nodes in script have been processed.
        if (this._node.index < this._node.body.length) {
            // Set current node to node in body.
            this._node.index++;
            this._set_node(this._node.body[this._node.index - 1]);
                    
            // Return to the processor.
            this._process_nodes();
        } else {
            // Change status and end the running process.            
            this._node.index = 0;
            this._status = 2;
        
            // Complete the inline item.    
            if (this._inline_script !== null) {
                this._inline_script._complete();
            }
        }    
    }

    /** Process an AST return statement. */
    _return_statement() {
        // Initialize status property.
        this._node.status = (typeof this._node.status === 'undefined') ? 0 : this._node.status;

        // Process the current status.
        switch (this._node.status) {
            case 0:
                // Process object.
                this._node.status = 1;
                this._set_node(this._node.argument);

                // Return to the node processessor.
                this._process_nodes();
                break;
            case 1:
                // Set return value.
                var return_value = {type: 'identifier', value: this._node.return_values[0].value};

                // Set the return value
                this._function_stack.push(return_value);
            
                // Reset node index and return to the parent node.
                this._node.status = 0;
                this._node.return_values = [];
                this._node = this._node.parent;
                this._process_nodes();
                break;
        }        
    }     

    /** Process an AST unary expression. */
    _unary_expression() {
        // Initialize node specific properties.
        this._node.status = (typeof this._node.status === 'undefined') ? 0 : this._node.status;

        // Process the current status.
        if (this._node.status === 0) {
            // Set parent node.
            this._node.status = 1;
            this._set_node(this._node.argument);

            // Return to the node processor.
            this._process_nodes();
        } else {
            var return_value = {type: 'literal'};

            // process the operator.
            switch (this._node.operator) {
                case '!' : 
                    return_value.value = !(this._node.return_values[0].value);
                    break;        
                case '-' : 
                    return_value.value = -(this._node.return_values[0].value);
                    break;        
            }   
                        
            // Set the return value
            this._set_return_value(return_value);

            // Return to the node processessor.
            this._node.status = 0;
            this._node.return_values = [];
            this._node = this._node.parent;
            this._process_nodes();
        }
    }    

    /** Process an AST update expression. */
    _update_expression() {
        // Initialize node specific properties.
        this._node.status = (typeof this._node.status === 'undefined') ? 0 : this._node.status;

        // Process the current status.
        if (this._node.status === 0) {
            // Set parent node.
            this._node.status = 1;
            this._set_node(this._node.argument);

            // Return to the node processor.
            this._process_nodes();
        } else {
            // Process the init value.
            switch (this._node.operator) {
                case '++' : 
                    this._set_element_value(this._node.return_values[0],this._get_element_value(this._node.return_values[0]) + 1);
                    break;
            }   
            
            // Return to the node processessor.
            this._node.status = 0;
            this._node.return_values = [];
            this._node = this._node.parent;
            this._process_nodes();
        }
    }    

    /** Process an AST variable declaration. */
    _variable_declaration() {
        // Initialize node specific properties.
        this._node.index = (typeof this._node.index === 'undefined') ? 0 : this._node.index;
        
        // Check if all nodes in script have been processed.
        if (this._node.index < this._node.declarations.length) {
            // Set current node to next node in list.
            this._node.index++;
            this._set_node(this._node.declarations[this._node.index - 1]);
        
            // Return to the processor.
            this._process_nodes();
        } else
        {    
            // Reset node index and return to the parent node.
            this._node.index = 0;
            this._node = this._node.parent;
            this._process_nodes();
        }
    }    

    /** Process an AST variable declarator. */
    _variable_declarator() {
        // Initialize node specific properties.
        this._node.status = (typeof this._node.status === 'undefined') ? 0 : this._node.status;

        // Process the current status.
        switch (this._node.status) {
            case 0:
                // process id.
                this._node.status = 1;
                this._set_node(this._node.id);

                // Return to the processor.
                this._process_nodes();
                break;
            case 1:
                // Process init.
                this._node.status = 2;
                this._set_node(this._node.init);

                // Return to the processor.
                this._process_nodes();
                break;
            case 2:
                // Process the init value.
                this._set_element_value(this._node.return_values[0],this._get_element_value(this._node.return_values[1]));
                
                // Reset node index and return to the parent node.
                this._node.status = 0;
                this._node.return_values = [];
                this._node = this._node.parent;
                this._process_nodes();
                break;
        }
    }   
 
    /** Process an AST while statement. */
    _while_statement() {
        // Initialize status property.
        this._node.break = (typeof this._node.break === 'undefined') ? false : this._node.break;
        this._node.status = (typeof this._node.status === 'undefined') ? 0 : this._node.status;

        // Process the current status.
        switch (this._node.status) {
            case 0:
                // Check for the break flag.
                if (this._node.break === true) {
                    this._node.break = false;
                    // Set parent node.
                    this._node.status = 0;
                    this._node.return_values = [];
                    this._node = this._node.parent;
                    this._process_nodes();            
                } else {
                    // Process object.
                    this._node.status = 1;
                    this._set_node(this._node.test);

                    // Return to the node processeor.
                    this._process_nodes();
                }
                break;
            case 1:
                // Check if expression is true.
                if (this._node.return_values[0].value === true) {
                    // Reset the test
                    this._node.status = 0;
                    this._node.return_values = [];
                    
                    // execute the body.
                    this._set_node(this._node.body);

                    // Return to the node processor.
                    this._process_nodes();
                } else {
                    // Set parent node.
                    this._node.status = 0;
                    this._node.return_values = [];
                    this._node = this._node.parent;
                    this._process_nodes();
                }
                break;
        }        
    }

    /** Process all AST nodes. */
    _process_nodes() {
        // Select type of processing.
        if (this._statement === null) {
            // Script processing.
            this._process_nodes_jump();
        } else {
            if (this._node === this._statement) {
                // Return the result value of the expression.
                return (this._node.body[0].return_values[0].value);
            } else {
                // Statement processing.
                this._process_nodes_timeout();
            }
        }
    }    

    /** Process a single AST nodes (timeout is for non-blocking) */
    _process_nodes_jump() {
        // Increase the stack counter.
        this._stack++;
        if (this._stack > 500) {
            // Clear the stack.
            this._stack = 0;
            
            // Process nodes with a timeout (this is a hack for clearing the browser cache. 
            setTimeout(function() { 
                this._process_nodes_timeout();
            }.bind(this),1);
        } else {
            // Process the nodes without a timeout.
            this._process_nodes_timeout();
        }
    }    
    
    /** Process a single AST nodes (timeout is for non-blocking) */
    _process_nodes_timeout() {
        // Select the type of node to process
        switch (this._node.type) {
            case 'ArrayExpression':
                this._array_expression();
                break;
            case 'AssignmentExpression':
                this._assignment_expression();
                break;
            case 'BinaryExpression':
                this._binary_expression();
                break;
            case 'BlockStatement':
                this._block_statement();
                break;
            case 'BreakStatement':
                this._break_statement();
                break;
            case 'CallExpression':
                this._call_expression();
                break;
            case 'EmptyStatement':
                this._empty_statement();
                break;
            case 'ExpressionStatement':
                this._expression_statement();
                break;
            case 'ForStatement':
                this._for_statement();
                break;
            case 'ForInStatement':
                this._for_in_statement();
                break;
            case 'FunctionExpression':
                this._function_expression();
                break;
            case 'Identifier':
                this._identifier();
                break;
            case 'IfStatement':
                this._if_statement();
                break;
            case 'Literal':
                this._literal();
                break;
            case 'LogicalExpression':
                this._logical_expression();
                break;
            case 'MemberExpression':
                this._member_expression();
                break;
            case 'NewExpression':
                this._new_expression();
                break;
            case 'Program':
                this._program();
                break;
            case 'ReturnStatement':
                this._return_statement();
                break;
            case 'UnaryExpression':
                this._unary_expression();
                break;
            case 'UpdateExpression':
                this._update_expression();
                break;
            case 'VariableDeclaration':
                this._variable_declaration();
                break;
            case 'VariableDeclarator':
                this._variable_declarator();
                break;
            case 'WhileStatement':
                this._while_statement();
                break;
            default:
                this._runner._debugger.addError('Invalid node type to process: ' + this._node.type);
        }    
    }    
   
    /**
     * Run a single line python AST statement.
     * @param {Object} ast_tree - The AST tree to run.
     * @return {Boolean|Number|Object|String} - The result value of the AST evaluation.
     */
    _run_statement(ast_tree) {
        this._node = ast_tree.body[0];
        this._node.parent = ast_tree;
        this._statement = ast_tree;

        // Adjust status of partser to running and start the process.
        this._status = 1;
        
        // Process the nodes.
        this._process_nodes();
        
        // Return the result value of the expression.
        if (ast_tree.body[0].return_values[0].type === 'identifier') {
            var return_value = this._get_element_value(ast_tree.body[0].return_values[0])        
        } else {
            var return_value = ast_tree.body[0].return_values[0].value;
        }

        // Clear the return value container for next cycle.
        ast_tree.body[0].return_values = [];
        
        // Retur value of the statement.
        return return_value;
    }

    /**
     * Run an AST python script.
     * @param {Object} inline_script - The Inline Script item to which the AST tree belongs.
     * @param {Object} ast_tree - The AST tree to run.
     */
    _run(inline_script, ast_tree) {
        // Set the inline item. 
        this._inline_script = inline_script;

        // set the self parameter.
        this._variables['self'] = inline_script;

        // Set the first node and its parent.
        this._node = ast_tree;
        this._node.parent = null;
        this._statement = null;
        
        // Adjust status of partser to running and start the process.
        this._status = 1;
        this._process_nodes();
    }
}
 