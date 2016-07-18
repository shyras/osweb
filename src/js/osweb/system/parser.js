
(function() {
    // Definition of the class session.
    function parser() {
	throw 'The class parser cannot be instantiated!';
    }

    // Definition of private properties.
    parser._ast_tree = null;    
    parser._current_node = null;
    parser._inline_script = null;
    parser._status = 0;                      
                
    // Definition of private methods - prepare cycle.   

    parser._prepare = function(script) {
        if (script !== '') {
            var locations = false;
            var parseFn = filbert_loose.parse_dammit;
            var ranges = false;
        		
	    try {
                var code = script;
           	var ast = parseFn(code, { locations: locations, ranges: ranges });
	        return ast;
    	    }
       	    catch (e) {
        	console.log('error');
        	console.log(e.toString());
                return null;
            }
        } else
	{
            return null;
        }	   	
    };
    
    // Definition of private methods - general parser functions.

    parser._set_return_value = function(node, value) {
        var index = 0;
        while (typeof node['returnvalue' + String(index)] !== 'undefined') {
            index++;
        }    
        
        // Set the return value\
        node['returnvalue' + String(index)] = value;
    };
    
    // Definition of private methods - node processing.
    
    parser._node_binary_expression = function() {
        // Initialize status property.
        this._current_node.status = (typeof this._current_node.status === 'undefined') ? 0  : this._current_node.status; 
        
        // Process the current status.
        switch (this._current_node.status) {
            case 0: 
                // process right expression;
                this._current_node.status = 1;
                this._current_node.right.parent = this._current_node;
                this._current_node = this._current_node.right;

                // Return to the node processessor.
                this._process_node();
            break;        
            case 1: 
                // process right expression;
                this._current_node.status = 2;
                this._current_node.left.parent = this._current_node;
                this._current_node = this._current_node.left;

                // Return to the node processessor.
                this._process_node();
            break;        
            case 2: 
                var left,right;
                if  (typeof window[this._current_node.returnvalue0] === 'undefined') {
                    var right = this._current_node.returnvalue0;
                }
                else {
                    var right = window[this._current_node.returnvalue0];
                }
                var left,right;
                if  (typeof window[this._current_node.returnvalue1] === 'undefined') {
                    var left = this._current_node.returnvalue1;
                }
                else {
                    var left = window[this._current_node.returnvalue1];
                }
            
                // Select the binary operator to perform.
                switch (this._current_node.operator) {
                    case '-':
                        // Process call - check for blocking methods.
                        this._set_return_value(this._current_node.parent,left - right);
                    break;
                }

                // Set parent node.
                this._current_node.status = 3;
                this._current_node = this._current_node.parent;

                // Return to the node processessor.
                this._process_node();
            break;        
        }    
    };    

    parser._node_call_expression = function() {
        // Initialize status property.
        this._current_node.arguments = (typeof this._current_node.arguments === 'undefined') ? [] : this._current_node.arguments;
        this._current_node.index = (typeof this._current_node.index === 'undefined') ? 0  : this._current_node.index; 
        this._current_node.status = (typeof this._current_node.status === 'undefined') ? 0  : this._current_node.status; 
        
        // Process the current status.
        switch (this._current_node.status) {
            case 0: 
                // Process arguments.
                if (this._current_node.index < this._current_node.arguments.length) {
                    // Set current node to next node in list.
                    this._current_node.index++;
                    this._current_node.arguments[this._current_node.index - 1].parent = this._current_node;
                    this._current_node = this._current_node.arguments[this._current_node.index - 1];
        
                    // Return to the node processessor.
                    this._process_node();
                } 
                else { 
                    // Set parent node.
                    this._current_node.status = 1;

                    // Return to the node processessor.
                    this._process_node();
                }
            break;
            case 1: 
                // Set parent node.
                this._current_node.status = 2;
                this._current_node.callee.parent = this._current_node;
                this._current_node = this._current_node.callee;

                // Return to the node processessor.
                this._process_node();
            break;    
            case 2: 
                // Set status of node.
                this._current_node.status = 3;
            
                // Create the aruments array.
                var tmp_arguments = [];
                for (var i=0;i< this._current_node.arguments.length; i++) {
                    if (typeof window[this._current_node['returnvalue' + String(i)]] !== 'undefined') {
                        tmp_arguments.push(window[this._current_node['returnvalue' + String(i)]]);
                    }    
                    else {    
                        tmp_arguments.push(this._current_node['returnvalue' + String(i)]);
                    }    
                }    
                    
                // Select the type of call to process
                var callee = this._current_node['returnvalue' + String(this._current_node.arguments.length)];
                var returnvalue = null;
                if (callee.type == 'function') {
                    // function call
                    returnvalue = window[callee.obj].apply(null, tmp_arguments);
                    
                    // Process call - check for blocking methods.
                    this._current_node.parent['returnvalue' + String(this._current_node.arguments.length)] = returnvalue;
                
                    // Return to the node processessor.
                    this._process_node();
                }    
                else if (callee.type == 'object') {
                    if ((callee.obj == 'clock') && (callee.prop == 'sleep')) {
                        // Process special calls with blocking (no direct result processing).
                        window[callee.obj][callee.prop].apply(window[callee.obj], tmp_arguments);
                    }    
                    else {    
                        // object methods calls.
                        returnvalue = window[callee.obj][callee.prop]();
                    
                        // Process call - check for blocking methods.
                        this._current_node.parent['returnvalue' + String(this._current_node.arguments.length)] = returnvalue;
                
                        // Return to the node processessor.
                        this._process_node();
                    }        
                }
                else {
                    switch (callee) {   
                        case 'canvas':
                            returnvalue = new osweb.canvas();
                        break;    
                    }    
                  
                    // Process call - check for blocking methods.
                    this._current_node.parent['returnvalue' + String(this._current_node.arguments.length)] = returnvalue;
                
                    // Return to the node processessor.
                    this._process_node();
                }    
            break;    
            case 3: 
                // Set parent node.
                this._current_node.status = 4;
                this._current_node = this._current_node.parent;

                // Return to the node processessor.
                this._process_node();
            break;        
        }    
    };

    parser._node_expression_statement = function() {
        // Initialize status property.
        this._current_node.status = (typeof this._current_node.status === 'undefined') ? 0  : this._current_node.status; 
        
        // Process the current status.
        switch (this._current_node.status) {
            case 0: 
                // Set parent node.
                this._current_node.status = 1;
                this._current_node.expression.parent = this._current_node;
                this._current_node = this._current_node.expression;

                // Return to the node processessor.
                 this._process_node();
            break;
            case 1: 
                // Set parent node.
                this._current_node.status = 2;
                this._current_node = this._current_node.parent;

                // Return to the node processessor.
                this._process_node();
            break;
        ;}    
    };

    parser._node_identifier = function() {
        // Return function result.
        if (typeof window[this._current_node.name] === 'undefined') {
            // Item is undefined, create it without value/type definition.
            window[this._current_node.name] = null;
        }
        
        // Set the return value.
        this._set_return_value(this._current_node.parent, this._current_node.name);

        // Set parent node.
        this._current_node = this._current_node.parent;

        // Return to the node processessor.
        this._process_node();
    };

    parser._node_literal = function()
    {
        // Set the return value.
        this._set_return_value(this._current_node.parent, this._current_node.value);
        
        // Set parent node.
        this._current_node = this._current_node.parent;

        // Return to the node processessor.
        this._process_node();
    };

    parser._node_member_expression = function()
    {
        // Initialize status property.
        this._current_node.status = (typeof this._current_node.status === 'undefined') ? 0 : this._current_node.status; 
        
        // Process the current status.
        switch (this._current_node.status) {
            case 0: 
                // Process object.
                this._current_node.status = 1;
                this._current_node.object.parent = this._current_node;
                this._current_node = this._current_node.object;
                
                // Return to the node processessor.
                this._process_node();
            break;    
            case 1: 
                // Process object.
                this._current_node.status = 2;
                this._current_node.property.parent = this._current_node;
                this._current_node = this._current_node.property;

                // Return to the node processessor.
                this._process_node();
            break;    
            case 2: 
                // Set the return value.
                //console.log('member->');
                //console.log(typeof this._current_node.returnvalue0);
                    
                if (typeof this._current_node.returnvalue0 == 'object') {
                    this._set_return_value(this._current_node.parent,{ 'obj': this._current_node.returnvalue1, 'prop': null, 'type': 'function'});
                }
                else {    
                    this._set_return_value(this._current_node.parent,{ 'obj': this._current_node.returnvalue0, 'prop': this._current_node.returnvalue1,'type':'object'});
                }
                
                // Set parent node.
                this._current_node.status = 3;
                this._current_node = this._current_node.parent;

                // Return to the node processessor.
                this._process_node();
            break;    
        }        
    };

    parser._node_program = function()
    {
        // Initialize index counter only the fitst time.
        this._current_node.index = (typeof this._current_node.index === 'undefined') ? 0 : this._current_node.index; 
        this._current_node.status = (typeof this._current_node.status === 'undefined') ? 0 : this._current_node.status; 
        
        // Process the current status.
        switch (this._current_node.status) {
            case 0: 
                // Check if all nodes in script have been processed.
                if (this._current_node.index < this._current_node.body.length) {
                    // Set current node to next node in list.
                    this._current_node.index++;
                    this._current_node.body[this._current_node.index - 1].parent = this._current_node;
                    this._current_node = this._current_node.body[this._current_node.index - 1];

                    // Return to the node processessor.
                    this._process_node();
                }
                else {
                    // End status.
                    this._current_node.status = 1;
                
                    // Return to the node processessor.
                    this._process_node();
                }    
            break;
            case 1:
                // Change the node stats.                                
                this._current_node.status = 2;

                // All nodes are processed, set status to finished.
                this._status = 2;
        
                // Complete the inline item.    
                if (this._inline_script != null) {    
                    this._inline_script.complete();
                }    
            break;    
        }   
    };    

    parser._node_variable_declaration = function()
    {
        // Initialize index counter only the fitst time.
        this._current_node.index = (typeof this._current_node.index === 'undefined') ? 0 : this._current_node.index; 
        this._current_node.status = (typeof this._current_node.status === 'undefined') ? 0 : this._current_node.status; 
        
        // Process the current status.
        switch (this._current_node.status) {
            case 0: 
                // Check if all nodes in script have been processed.
                if (this._current_node.index < this._current_node.declarations.length) {
                    // Set current node to next node in list.
                    this._current_node.index++;
                    this._current_node.declarations[this._current_node.index - 1].parent = this._current_node;
                    this._current_node = this._current_node.declarations[this._current_node.index - 1];

                    // Return to the node processessor.
                    this._process_node();
                } 
                else {
                    // Change the node stats.                                
                    this._current_node.status = 1;

                    // Return to the node processessor.
                    this._process_node();
                }    
            break; 
            case 1:
                // Change the node stats.                                
                this._current_node.status = 2;

                // Set parent node.
                this._current_node = this._current_node.parent;

                // Return to the node processessor.
                this._process_node();
            break;
        }   
    };

    parser._node_variable_declarator = function()
    {
        // Initialize status property.
        this._current_node.status = (typeof this._current_node.status === 'undefined') ? 0 : this._current_node.status; 
        
        // Process the current status.
        switch (this._current_node.status) {
            case 0: 
                // Process init.
                this._current_node.status      = 1;
                this._current_node.init.parent = this._current_node;
                this._current_node             = this._current_node.init;
                
                // Return to the node processessor.
                this._process_node();
            break;    
            case 1: 
                // process id.
                this._current_node.status    = 2;
                this._current_node.id.parent = this._current_node;
                this._current_node           = this._current_node.id;

                // Return to the node processessor.
                this._process_node();
            break;    
            case 2: 
                // Set variable.
                window[this._current_node.returnvalue1] = this._current_node.returnvalue0;      
                
                // Set parent node.
                this._current_node.status = 3;
                this._current_node = this._current_node.parent;

                // Return to the node processessor.
                this._process_node();
            break;    
        }
    };

    // Definition of private methods - general node processing.

    parser._process_node = function() {
        console.log('processing node');
        console.log(this._current_node);
        
        // Select the type of node to process
        switch(this._current_node.type) { 
            case 'BinaryExpression':
                this._node_binary_expression();
            break;
            case 'CallExpression':
                this._node_call_expression();
            break;
            case 'ExpressionStatement':
                this._node_expression_statement();
            break;
            case 'Identifier':
                this._node_identifier();
            break;
            case 'Literal':
                this._node_literal();
            break;
            case 'MemberExpression':
                this._node_member_expression();
            break;
            case 'Program':
                this._node_program();
            break;
            case 'VariableDeclaration':
                this._node_variable_declaration();
            break; 
            case 'VariableDeclarator':
                this._node_variable_declarator();
            break; 
        }
    };

    // Definition of private methods - run cycle.

    parser._runstatement = function(node) {
        // Call the expression statement en return the value.       
        return this._node_call_expression(node.expression);
    };
    
    parser._run = function(inline_script, ast_tree) {
        // Set the inline item. 
	this._inline_script = inline_script;
	
	// Set the first node and its parent.
	this._current_node = ast_tree;
        this._current_node.parent = null;
        this._status = 1;
        
    	// Process the nodes. 
	osweb.parser._process_node();
    };

    // Bind the parser class to the osweb namespace.
    osweb.parser = parser;
}()); 
