module.exports = function(osweb){
    "use strict";

    // Class python - parsing and running python script within osweb.      
    function python() {
        throw 'The class python cannot be instantiated!';
    }

    // Definition of private properties.
    python._classes = {};               // Accessible classes within the script code.
    python._inline_script = null;       // Parent inline_script item.
    python._node = null;                // Current active node.  
    python._global_return_value = null; // Global return value for blocking calls.
    python._stack = 0;                  // Stack counter (hack to precent stack overflow).
    python._status = 0;                 // Status of the walker.
    
    // Definition of private methods - parse cycle.   

    python._initialize = function() {
         // Add internal libraries to the interpreter.
        osweb.python_math._initialize();
        osweb.python_opensesame._initialize();
        osweb.python_random._initialize();
        osweb.python_string._initialize();
        console.log(filbert);
    
        // Add opensesame system classes to the interpreter.
        python._classes['items'] = window['items'];
        python._classes['pool'] = window['pool'];
        python._classes['var'] = window['var'];
    };

    // Definition of private methods - parsing script to ast nodes.

    python._parse = function(script) {
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
            } 
            catch (e) {
                osweb.debug.addError(osweb.constants.ERROR_201 + e.toString);
                return null;
            }
        } 
        else {
            return null;
        } 
    };

    // Definition of private methods - node processing support methods.

     python._get_context = function(identifier) {
        // Split the identifer
        var items = identifier.split('.');

        if ((items[0] === '__pythonRuntime') && (items[1] === 'imports')) {
            return window[items[2]];
        }
        else {
            // Return the object context
            return window[items[0]];
        }     
    };

   python._get_item = function(identifier, new_arguments) {
        // Check for object methods.
        if ((typeof identifier === 'number') || (typeof identifier === 'object') || (typeof identifier === 'boolean')) {
            return identifier;
        }        
        else {
            var items = identifier.split('.');
            switch (items[0]) {
                case '__pythonRuntime':
                    if (items[1] === 'functions') {
                        return filbert.pythonRuntime.functions[items[2]];
                    }
                    else if (items[1] === 'objects') {
                        return filbert.pythonRuntime.objects[items[2]];
                    }
                    else if (items[1] === 'ops') {
                        return filbert.pythonRuntime.ops[items[2]];
                    }
                    else if (items[1] === 'imports') {
                        var import_lib = filbert.pythonRuntime.imports[items[2]];
                        return import_lib[items[3]];
                    }
                    break;
                default:
                    if (window[items[0]] !== undefined) {
                        if (items.length === 1) {
                            return window[items[0]];
                        }
                        else {
                            if (items[1] === '_pySlice') {
                                return window[items[0]]['_pySlice'];
                                /* if (typeof window[items[0]] === 'string') {
                                    return window[items[0]]['substring'];
                                }
                                else {
                                    return window[items[0]]['_pySlice'];
                                } */
                            }            
                            else {   
                                return window[items[0]][items[1]];
                            }        
                        }
                    }
                    else {
                        if (this._classes[items[0]] !== undefined) {
                            if (items.length === 1) {
                                // 
                                arguments.unshift(this._classes[items[0]]);
                                return this._new_object;
                            }
                            else {
                                return this._classes[items[0]][items[1]];
                            }    
                        }
                        else {
                            return items[0];
                        }    
                    }    
            }
        }        
    };

    python._new_object = function(Class) {
        // Create a new object class.
        return new (Function.prototype.bind.apply(Class, arguments));
    };

    python._set_node = function(node) {
        // Set the current node as the parent node
        node.parent = this._node;
        // Set the new node as the current node.
        this._node = node;
    };

    python._set_return_value = function(value) {
        // Create or acces the return_values array.
        this._node.parent.return_values = (typeof this._node.parent.return_values === 'undefined') ? [] : this._node.parent.return_values;

        // Push the value. 
        this._node.parent.return_values.push(value);
    };

    // Definition of private methods - processing specific node types.

    python._array_expression = function() {
        // Initialize node specific properties.
        this._node.index = (typeof this._node.index === 'undefined') ? 0 : this._node.index;

        // Check if all nodes in script have been processed.
        if (this._node.index < this._node.elements.length) {
            // Set current node to node in body.
            this._node.index++;
            this._set_node(this._node.elements[this._node.index - 1]);
                    
            // Return to the processor.
            this._process_nodes();
        } 
        else {
            // Define the return_values.
            var return_value = this._node.return_values;
            
            // Set the return value.
            this._set_return_value(return_value);
    
            // Reset node index and return to the parent node.
            this._node.index = 0;
            this._node.return_values = [];
            this._node = this._node.parent;
            this._process_nodes();
        }    
    };

    python._assignment_expression = function() {
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
                var left  = this._node.return_values[0].split('.');
                var right = this._get_item(this._node.return_values[1]);
                
                // Select binary operator.
                switch (this._node.operator) {
                    case '=': 
                        if (left.length === 1) {
                            window[left[0]] = right;
                        }
                        else {
                            window[left[0]][left[1]] = right;
                        }
                        break;    
                    case '-=': 
                        if (left.length === 1) {
                            window[left[0]] = window[left[0]] - right;
                        }
                        else {
                            window[left[0]][left[1]] = window[left[0]][left[1]] - right;
                        }
                        break;    
                    case '/=': 
                        if (left.length === 1) {
                            window[left[0]] = window[left[0]] / right;
                        }
                        else {
                            window[left[0]][left[1]] = window[left[0]][left[1]] / right;
                        }
                        break;    
                    case '%=': 
                        if (left.length === 1) {
                            window[left[0]] = window[left[0]] % right;
                        }
                        else {
                            window[left[0]][left[1]] = window[left[0]][left[1]] % right;
                        }
                        break;    
                }
        
                // Reset node index and return to the parent node.
                this._node.status = 0;
                this._node.return_values = [];
                this._node = this._node.parent;

                this._process_nodes();
                break;
        }    
    };

    python._binary_expression = function() {
         // Initialize status property.
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
                // Process property
                this._node.status = 2;
                this._set_node(this._node.right);

                // Return to the node processessor.
                this._process_nodes();
                break;
            case 2:
                // define variables
                var right = this._get_item(this._node.return_values.pop());
                var left = this._get_item(this._node.return_values.pop());
                var return_value;
                    
                // Select binary operator.
                switch (this._node.operator) {
                    case '-':
                        return_value = left - right;
                        break;
                    case '/':
                        return_value = left / right;
                        break;
                    case '==':
                        return_value = (left === right);
                        break;
                    case '!=':
                        return_value = (left !== right);
                        break;
                    case '>':
                        return_value = (left > right);
                        break;
                    case '<':
                        return_value = (left < right);
                        break;
                    case '>=':
                        return_value = (left >= right);
                        break;
                    case '<=':
                        return_value = (left <= right);
                        break;
                    case '%': 
                        if ((typeof left === 'number') && (typeof right === 'number')) {
                            return_value = left % right;
                        }
                        else {
                            return_value = left.replace(/%s/g, right);
                        }    
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
    };

    python._block_statement = function() {
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
        } 
        else {
            // Reset node index and return to the parent node.
            if (this._node.break === true) {
                this._node.break = false;
                this._node.parent.break = true;
            }
            
            this._node.index = 0;
            this._node = this._node.parent;
            this._process_nodes();
        }    
    };

    python._break_statement = function() {
        // Set break flag for parent element.
        this._node.parent.break = true; 
        
        // Return to the parent node.
        this._node = this._node.parent;
        this._process_nodes();
    };    

   python._call_expression = function() {
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
                } 
                else {
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

                // Get the argument used on the caller element.
                var tmp_arguments = [];
                for (var i = 0; i < this._node.return_values.length; i++) {
                    tmp_arguments.push(this._get_item(this._node.return_values[i]));
                }
            
                var context = this._get_context(return_value);
                var caller = this._get_item(return_value, tmp_arguments);
            
                // Check if the call is a blocking call. 
                console.log(return_value);
                if ((return_value === 'sleep') || (return_value === '__pythonRuntime.imports.clock.sleep')) {
                    // Adjust the status to special.
                    this._node.status = 2;
                
                    // Execute the blocking call.
                    caller.apply(context,tmp_arguments);
                }            
                else {
                    // Execute the call.
                    return_value = caller.apply(context,tmp_arguments);
                   
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
    };

    python._empty_statement = function() {
        // Set parent node.
        this._node = this._node.parent;

        // Return to the node processessor.
        this._process_nodes();
    };

    python._expression_statement = function() {
        // Initialize status property.
        this._node.status = (typeof this._node.status === 'undefined') ? 0 : this._node.status;

        // Process the current status.
        if (this._node.status === 0) {
            // Set parent node.
            this._node.status = 1;
            this._set_node(this._node.expression);

            // Return to the node processor.
            this._process_nodes();
        }
        else {
            // Set parent node.
            this._node.status = 0;
            this._node = this._node.parent;

            // Return to the node processessor.
            this._process_nodes();
        }
    };

    python._identifier = function() {
        // Set the return value.
        var return_value = this._node.name;

        // Set the return value.
        this._set_return_value(return_value);

        // Set parent node.
        this._node = this._node.parent;
        this._process_nodes();
    };

    python._if_statement = function() {
        // Initialize status property.
        this._node.break = (typeof this._node.break === 'undefined') ? false : this._node.break;
        this._node.status = (typeof this._node.status === 'undefined') ? 0 : this._node.status;

        // Process the current status.
        switch (this._node.status) {
            case 0:
                // Process object.
                this._node.status = 1;
                this._set_node(this._node.test);

                // Return to the node processessor.
                this._process_nodes();
                break;
            case 1:
                // Check if expression is true.
                if (this._node.return_values[0] === true) {
                    this._node.status = 2;
                    this._set_node(this._node.consequent);

                    // Return to the node processessor.
                    this._process_nodes();
                }
                else if (this._node.alternate !== null) {
                    this._node.status = 2;
                    this._set_node(this._node.alternate);

                    // Return to the node processessor.
                    this._process_nodes();
                }
                else {
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
    };

    python._for_in_statement = function() {
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
                // Execute the range.
                if (this._node.index < window[this._node.return_values[1]].length) {
                    // Set the value of the range.
                    window[this._node.return_values[0]] = window[this._node.return_values[1]][this._node.index];
                    
                    // Increase the index.
                    this._node.index++;
                    
                    // Execute the body.
                    this._set_node(this._node.body);
                    this._process_nodes();
                }
                else {
                    this._node.index = 0;
                    this._node.status = 0;
                    this._node.return_values = [];
                    this._node = this._node.parent;
                    this._process_nodes();
                }
                break;
        }        
    };

    python._literal = function() {
        // Set the return value.
        var return_value = this._node.value;
        this._set_return_value(return_value);

        // Set parent node.
        this._node = this._node.parent;
        this._process_nodes();
    };    

    python._member_expression = function() {
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
                // Build member expression.
                var return_value = this._node.return_values[0] + '.' + this._node.return_values[1];
                
                // Set the return value
                this._set_return_value(return_value);

                // Reset node index and return to the parent node.
                this._node.status = 0;
                this._node.return_values = [];
                this._node = this._node.parent;
                this._process_nodes();
                break;    
        }        
    };   
    
    python._new_expression = function() {
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
            } 
            else {
                // Set parent node.
                this._node.status = 1;
                this._set_node(this._node.callee);

                // Return to the node processor.
                this._process_nodes();
            }
        }
        else {
            // Get the caller element. 
            var return_value = this._node.return_values.pop();
            var context = this._get_context(return_value);
            var caller = this._get_item(return_value);
    
            // Create the aruments array.
            var tmp_arguments = [];
            for (var i = 0; i < this._node.return_values.length; i++) {
                tmp_arguments.push(this._get_item(this._node.return_values[i]));
            }

            // Execute the call.
            var return_value = caller.apply(context,tmp_arguments);

            // Set the return value
            this._set_return_value(return_value);

            // Reset node index and return to the parent node.
            this._node.index = 0;
            this._node.status = 0;
            this._node.return_values = [];
            this._node = this._node.parent;
            this._process_nodes();
        }
    };

  python._program = function() {
        // Initialize node specific properties.
        this._node.index = (typeof this._node.index === 'undefined') ? 0 : this._node.index;

        // Check if all nodes in script have been processed.
        if (this._node.index < this._node.body.length) {
            // Set current node to node in body.
            this._node.index++;
            this._set_node(this._node.body[this._node.index - 1]);
                    
            // Return to the processor.
            this._process_nodes();
        } 
        else {
            // Change status and end the running process.            
            this._node.index = 0;
            this._status = 2;
        
            // Complete the inline item.    
            if (this._inline_script !== null) {
              this._inline_script.complete();
            }
        }    
    };

    python._unary_expression = function() {
        // Initialize node specific properties.
        this._node.status = (typeof this._node.status === 'undefined') ? 0 : this._node.status;

        // Process the current status.
        if (this._node.status === 0) {
            // Set parent node.
            this._node.status = 1;
            this._set_node(this._node.argument);

            // Return to the node processor.
            this._process_nodes();
        }
        else {
            var return_value;

            // process the operator.
            switch (this._node.operator) {
                case '!' : 
                    return_value = !(this._node.return_values[0]);
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
    };    

    python._variable_declaration = function() {
        // Initialize node specific properties.
        this._node.index = (typeof this._node.index === 'undefined') ? 0 : this._node.index;
        
        // Check if all nodes in script have been processed.
        if (this._node.index < this._node.declarations.length) {
            // Set current node to next node in list.
            this._node.index++;
            this._set_node(this._node.declarations[this._node.index - 1]);
        
            // Return to the processor.
            this._process_nodes();
        } 
        else
        {    
            // Reset node index and return to the parent node.
            this._node.index = 0;
            this._node = this._node.parent;
            this._process_nodes();
        }
    };    

    python._variable_declarator = function() {
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
                var init = this._get_item(this._node.return_values[1], null);
                
                // Set the variable
                window[this._node.return_values[0]] = init;
                
                // Reset node index and return to the parent node.
                this._node.status = 0;
                this._node.return_values = [];
                this._node = this._node.parent;
                this._process_nodes();
                break;
        }
    };   
 
    python._while_statement = function() {
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
                }
                else {
                    // Process object.
                    this._node.status = 1;
                    this._set_node(this._node.test);

                    // Return to the node processessor.
                    this._process_nodes();
                }
                break;
            case 1:
                // Check if expression is true.
                if (this._node.return_values[0] === true) {
                    // Reset the test
                    this._node.status = 0;
                    this._node.return_values = [];
                    
                    // execute the body.
                    this._set_node(this._node.body);

                    // Return to the node processessor.
                    this._process_nodes();
                }
                else {
                    // Set parent node.
                    this._node.status = 0;
                    this._node.return_values = [];
                    this._node = this._node.parent;
                    this._process_nodes();
                }
                break;
        }        
    };

    // Definition of private methods - processing nodes.

    python._process_nodes = function() {
        // Increase the stack counter.
        this._stack++;
        if (this._stack > 500) {
            // Clear the stack.
            this._stack = 0;
            
            // Process nodes with a timeout (this is a hack for clearing the browser cache. 
            setTimeout(function() { this._process_nodes_timeout();}.bind(this),1);
        }
        else {
            // Process the nodes without a timeout.
            this._process_nodes_timeout();
        }
    };    

    python._process_nodes_timeout = function() {
        // Select the type of node to process
        // console.log(this._node);
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
            case 'ForInStatement':
                this._for_in_statement();
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
            case 'MemberExpression':
                this._member_expression();
                break;
            case 'NewExpression':
                this._new_expression();
                break;
            case 'Program':
                this._program();
                break;
            case 'UnaryExpression':
                this._unary_expression();
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
                osweb.debug.addError(osweb.constants.ERROR_203 + this._node.type);
        }    
    };    
   
    // Definition of private methods - run cycle.

    python._run = function(inline_script, ast_tree) {
        // Set the inline item. 
        this._inline_script = inline_script;

        // Set the first node and its parent.
        this._node = ast_tree;
        this._node.parent = null;
        
        // Adjust status of partser to running and start the process.
        this._status = 1;
        this._process_nodes();
    };

    // Bind the python class to the osweb namespace.
    return python;
};
