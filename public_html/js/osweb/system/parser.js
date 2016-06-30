
/*
 * Definition of the class session.
 */

(function() 
{
    function parser() 
    {
	throw "The class parser cannot be instantiated!";
    }

    // Definition of private properties.
    parser._ast_tree      = null;    
    parser._current_node  = null;
    parser._inline_script = null;
    parser._status        = 0;                      
                
    /*
     * Definition of private methods.   
     */

    parser._prepare = function(pScript)
    {
        if (pScript !== '')
        {
            var locations = false;
            var parseFn   = filbert_loose.parse_dammit;
            var ranges    = false;
        		
	    try 
	    {
                var code  = pScript;
           	var ast   = parseFn(code, { locations: locations, ranges: ranges });
        
	        return ast;
    	    }
       	    catch (e) 
            {
        	console.log('error');
        	console.log(e.toString());
    	 	
                return null;
            }
        }
	else
	{
            return null;
        }	   	
    };

    /* parser._node_identifier = function(pNode, pType)
    {
        // Select te type of identifier to process.
        switch (pType) 
        {   
            case 'object':
                // Process the object 
                switch(pNode.name)
                {
                    case 'canvas': 
                        return {'object': new osweb.canvas()};
                    break;    
                    case 'exp':
                        // Return the experiment object as exp.
                        return {'object': osweb.runner.experiment};
                    break;    
                    case 'mouse': 
                        // Create a osweb canvas object.
                        return {'object': new osweb.mouse()};
                    break;    
                    case 'self':
                        // Return the experiment object as self.
                        return {'object': osweb.runner.experiment};
                    break;    
                    case 'var': 
                        return {'object': osweb.runner.experiment.vars};
                    break;    
                    default:
                        // Check if the variable exists.
                        if (window[pNode.name] === undefined) 
                        {
                            // Create the variable with null setting.
                            window[pNode.name] = null;
                        
                            // Return the window variable.                
                            return {'object': pNode.name };
                        }
                        else
                        {
                            return {'object': window[pNode.name]};
                        }
                }            
            break;
            case 'property':
                return {'property': pNode.name};
            break;
            case 'value':
                return window[pNode.name];
            break    
        }    
    };

    parser._node_binary_expression = function(pNode)
    {
        // Process left node.
        var tmp_left;
        switch (pNode.left.type)  
        {
            case 'Identifier':
                tmp_left = this._node_identifier(pNode.left, 'value');
            break;    
            case 'Literal': 
                tmp_left = pNode.left.value;  
            break;    
        }

        // Process right node.
        var tmp_right;
        switch (pNode.right.type)  
        {
            case 'Identifier':
                tmp_right = this._node_identifier(pNode.right, 'value');
            break;    
            case 'Literal': 
                tmp_right = pNode.right.value;  
            break;    
        }

        // Process operator
        switch (pNode.operator)
        {
            case '-': 
                // Substraction.
                return tmp_left - tmp_right;
            case '%': 
                // Concatenation.    
                return tmp_left + tmp_right;
            break;        
        }
    };

    parser._node_call_expression = function(pNode)
    {
       // console.log('node_call_expression');

        // Process arguments.
        var tmp_arguments = [];
        for (var i = 0; i < pNode.arguments.length;i++)
        {
            // Process each argument depending on its type. 
            switch (pNode.arguments[i].type)
            {
                case 'BinaryExpression': 
                    tmp_arguments.push(this._node_binary_expression(pNode.arguments[i]));
                break;    
                case 'Literal': 
                    tmp_arguments.push(pNode.arguments[i].value);
                break;    
            } 
        }
        
        // Process caller.
        switch (pNode.callee.type)
        {
            case 'Identifier': 
                var tmp_callee  = this._node_identifier(pNode.callee, 'object');
                var call_result = tmp_callee.object;
            break;    
            case 'MemberExpression': 
                var tmp_callee = this._node_member_expression(pNode.callee);

                // Check if the given object is defined as string name or as an object itself.
                if (typeof tmp_callee.object === 'string')
                {
                    if (tmp_callee.object === 'function')
                    {
                        // Ugly hack for parameters.
                        switch (tmp_arguments.length)
                        {
                            case 0: var call_result = window[tmp_callee.property]();
                            break;        
                            case 1: var call_result = window[tmp_callee.property](tmp_arguments[0]);
                            break;        
                            case 2: var call_result = window[tmp_callee.property](tmp_arguments[0],tmp_arguments[1]);
                            break;        
                        }    
                    } 
                    else
                    {    
                        // Ugly hack for parameters.
                        switch (tmp_arguments.length)
                        {
                            case 0: var call_result = window[tmp_callee.object][tmp_callee.property]();
                            break;        
                            case 1: var call_result = window[tmp_callee.object][tmp_callee.property](tmp_arguments[0]);
                            break;        
                            case 2: var call_result = window[tmp_callee.object][tmp_callee.property](tmp_arguments[0],tmp_arguments[1]);
                            break;        
                        }    
                    }
                }    
                else
                {
                    switch (tmp_arguments.length)
                    {
                        case 0: var call_result = tmp_callee.object[tmp_callee.property]();
                        break;
                        case 1: var call_result = tmp_callee.object[tmp_callee.property](tmp_arguments[0]);
                        break;
                        case 2: var call_result = tmp_callee.object[tmp_callee.property](tmp_arguments[0],tmp_arguments[1]);
                        break;
                    }       
                }    
            break;    
        }
   
        if (tmp_callee.property != 'sleep')
        {
            // Temporal for loop testing.
            if (typeof tmp_callee.object === 'function')
            {    
                return tmp_callee.object(tmp_arguments[0],tmp_arguments[1]);
            }
            else
            {    
                // Return result.
                return call_result;
            }    
        }    
        else
        {
            return 'sleep';
        }    
    };

    parser._node_member_expression = function(pNode)
    {
        // Process the object leaf.
        switch (pNode.object.type)
        {
            case 'Identifier':
                var tmp_object = this._node_identifier(pNode.object, 'object');
            break;    
            case 'MemberExpression':
                var tmp_object = this._node_member_expression(pNode.object);
                if (tmp_object.property == 'functions')
                {
                    tmp_object.object = 'function';
                }  
            break;    
        }
     
        // Process the property leaf.
        switch (pNode.property.type)
        {
            case 'Identifier':
                var tmp_property = this._node_identifier(pNode.property,'property');
            break;    
        }

        // Return the function result.
        return {'object': tmp_object.object, 'property': tmp_property.property};
    };


    parser._node_block_expression = function(pNode)
    {
        console.log('node_block_expression');
        console.log(pNode);
        
        // Set parent node.
        this._current_node = this._current_node.parent;

        // Set the parser status.
        this._process_node();
    };    

    parser._node_expression_statement = function(pNode)
    {
        // Process the expression
        switch (pNode.expression.type)
        {
            case 'CallExpression':
                var tmp_expression = this._node_call_expression(pNode.expression);    
            break;
        } 

        if (tmp_expression != 'sleep')
        {
            // Set parent node.
            this._current_node = this._current_node.parent;

            // Set the parser status.
            this._process_node();
        }
    };

    parser._node_variable_declarator = function(pNode)
    {
        //console.log('node_variable_declarator');
        //console.log(pNode);
        
        // Process the id lead.
        switch (pNode.id.type)
        {
            case 'Identifier':
                // Process id as identifier.
                var tmp_id = this._node_identifier(pNode.id, 'object');
            break;    
        }

        // Process the init leaf.
        switch (pNode.init.type)
        {
            case 'BinaryExpression': 
                // Process init as call expression.
                var tmp_init = this._node_binary_expression(pNode.init);
            break;    
            case 'CallExpression':
                // Process init as call expression.
                var tmp_init = this._node_call_expression(pNode.init, true);    
            break;    
        }

        // Process declaration.
        if (typeof tmp_id.object === 'string')
        {
            window[tmp_id.object] = tmp_init;
        } 
        else
        {
            console.log('b');
        }   

        // Set parent node.
        this._current_node = this._current_node.parent;

        // Set the parser status.
        this._process_node();
    };


    parser._node_if_statement = function(pNode)
    {
        console.log('if');
        
        // Set parent node.
        this._current_node = this._current_node.parent;

        // Set the parser status.
        this._process_node();
    };    */
    
    
    parser._process_literal = function(pNode)
    {
        // Return function result.
        return pNode.value;
    };

    parser._process_identifier = function(pNode)
    {
        // Return function result.
        if (typeof window[pNode.name] === 'undefined')
        {
            // Return the string name.
            return pNode.name;
        }    
        else
        {
            // Return the global defined object.
            return window[pNode.name];
        }    
    };

    parser._process_assignment_expression = function(pNode)
    {
        console.log('processing assignment expression');

        // Process right node
        var right;
        switch (pNode.right.type)
        {
            case 'Literal': 
                // Process member expression.
                right  = this._process_literal(pNode.right);
            break;    
        }

        // Process left node
        var left;
        switch (pNode.left.type)
        {
            case 'MemberExpression': 
                // Process member expression.
                left  = this._process_member_expression(pNode.left);
            break;    
        }

        // process operator
        switch (pNode.operator)
        {
            case '=':
                // Process the '=' operator.
                left = right;    
            break;    
        }
    };
    
    parser._process_binary_expression = function(pNode)
    {
        // Process right node
        var right_node;
        switch (pNode.right.type)  
        {
            case 'Identifier':
                right_node = this._process_identifier(pNode.right);
            break;    
            case 'Literal': 
                right_node = this._process_literal(pNode.right);  
            break;    
            }
    };        

    
    
    parser._process_call_expression = function(pNode)
    {
        // Process arguments node.
        var tmp_arguments = [];
        for (var i = 0; i < pNode.arguments.length;i++)
        {
            // Process each argument depending on its type. 
            switch (pNode.arguments[i].type)
            {
                case 'BinaryExpression': 
                    tmp_arguments.push(this._process_binary_expression(pNode.arguments[i]));
                break;    
                case 'Identifier': 
                    tmp_arguments.push(this._process_identifier(pNode.arguments[i]));
                break;    
                case 'Literal': 
                    tmp_arguments.push(this._process_literal(pNode.arguments[i]));
                break;    
            } 
        }

        // Process call node.
        var callee;
        switch (pNode.callee.type)
        {
            case 'MemberExpression':
                callee = this._process_member_expression(pNode.callee);
            break;
        }

        console.log(callee);

        // Execute call expression.
        if (typeof callee.object === 'object')
        {
            switch (tmp_arguments.length)
            {
                case 0: 
                    return callee.object[callee.property]();
                break;        
                case 1: 
                    return callee.object[callee.property](tmp_arguments[0]);
                break;    
                case 2: 
                    return callee.object[callee.property](tmp_arguments[0],tmp_arguments[1]);
                break;
                case 3: 
                    return callee.object[callee.property](tmp_arguments[0],tmp_arguments[1],tmp_arguments[2]);
                break;    
            }
        }    
        else 
        {
            console.log(typeof callee.property);
            // Function processing.
            switch (tmp_arguments.length)
            {
                case 0: 
                    return callee.property();
                break;        
                case 1: 
                    return callee.property(tmp_arguments[0]);
                break;    
                case 2: 
                    return callee.property(tmp_arguments[0],tmp_arguments[1]);
                break;
                case 3: 
                    return callee.property(tmp_arguments[0],tmp_arguments[1],tmp_arguments[2]);
                break;    
            }
            
            // Return function result.
            return null;
        }    
    };

    parser._process_member_expression = function(pNode)
    {
        var member = {};
        switch (pNode.object.type)
        {
            case 'Identifier': 
                member.object = this._process_identifier(pNode.object);
            break;    
            case 'MemberExpression':
                member.object = 'function';
            break;    
        }
        switch (pNode.property.type)
        {
            case 'Identifier':
                member.property = this._process_identifier(pNode.property);
            break;        
        }    
            
        // Return function result.
        return member;
    };

    parser._process_variable_declarator = function(pNode)
    {
        // processing variable declaration.
        console.log('processing variable declarator');
        console.log(pNode);
        
        // Process initialize value for variable.
        var init;
        switch (pNode.init.type) 
        {
            case 'CallExpression':
                // Get call expression.
                init = this._process_call_expression(pNode.init);
            break;
            case 'Literal': 
                init = pNode.init.value;
            break;        
        }
        
        // Process identifier value for variable.
        switch (pNode.id.type) 
        {
            case 'Identifier':
                window[pNode.id.name] = init;
            break; 
        }

        console.log(window[pNode.id.name]);
    };    

    /*
     * Definition of private methods - global declaration and statement nodes.   
     */

    parser._process_expression_statement = function()
    {
        // Process the expression
        console.log('processing expression statement');
        
        // Select type of expression to process.
        switch (this._current_node.expression.type)
        {
            case 'AssignmentExpression':
                // Process an assignment expression.
                this._process_assignment_expression(this._current_node.expression);
            break;    
            case 'CallExpression':
                this._process_call_expression(this._current_node.expression);
            break;    
        }
    
        // Set parent node.
        this._current_node = this._current_node.parent;

        // Set the parser status.
        this._process_node();
    };    

    parser._process_variable_declaration = function()
    {
        // Process list of variables.
        for (var i = 0;i < this._current_node.declarations.length;i++)
        {
            this._process_variable_declarator(this._current_node.declarations[i]);
        }    
    
        // Set parent node.
        this._current_node = this._current_node.parent;

        // Set the parser status.
        this._process_node();
    };   

    parser._process_program = function()
    {
        // Check if all nodes in script have been processed.
        if (this._current_node.index < this._current_node.body.length)		
	{
            // Set current node to next node in list.
            this._current_node.index++;
            this._current_node.body[this._current_node.index - 1].parent = this._current_node;
            this._current_node = this._current_node.body[this._current_node.index - 1];

            // Return to the node processessor.
            this._process_node();
        }
        else
        {
            // All nodes are processed, set status to finished.
            this._status = 2;
        
            // Complete the inline item.    
            if (this._inline_script != null)
            {    
                this._inline_script.complete();
            }    
        } 
    }; 

    /*
     * Definition of private methods - global node processor.   
     */

    parser._process_node = function()
    {
        console.log(this._current_node);
        
        // Set the parser status.
        switch (this._current_node.type)
	{
            case 'Program':
                // Process program node.
                this._process_program();
            break; 
            case 'ExpressionStatement':
                // Process a variable declarator.
                this._process_expression_statement();
            break;		
            case 'IfStatement':
                // Process a if statement declarator.
                this._process_if_statement();
            break;

            case 'BlockStatement':
                // Process a variable declarator.
                //this._node_block_expression(this._current_node);
            break;		
            case 'EmptyStatement':
                // Set parent node.
                //this._current_node = this._current_node.parent;

                // Set the parser status.
                //this._process_node();
            break
            case 'VariableDeclaration':
                // Process a variable declarator.
                this._process_variable_declaration();
            break; 
        }
    };


    /*
     * Definition of private methods - expressions
     */

    parser._expression = function(pNode)
    {
        console.log('expression');
        console.log(pNode);

        switch (pNode.type)
        {
        }
    
        return 'a';
    };

    /*
     * Definition of private methods - statements
     */

    parser._block_statement = function()
    {
        console.log('block statement');
        console.log(this._current_node);
    };    

    parser._expression_statement = function()
    {
        // Process the experession node from the statement.
        var returnvalue = this._expression(this._current_node.expression);
        
        if (returnvalue !== null)
        {
            // Set parent node.
            this._current_node = this._current_node.parent;

            // Next step.
            this._statement();
        }    
    };

    parser._variable_declarator = function(pNode)
    {
        console.log('variable declaration');
        
        // Next step.
        this._statement();
    };    

    parser._variable_declaration = function()
    {
        // Initialize index counter only the fitst time.
        this._current_node.index = (typeof this._current_node.index === 'undefined') ? 0 : this._current_node.index; 
        
        // Check if all nodes in script have been processed.
        if (this._current_node.index < this._current_node.declarations.length)		
	{
            // Set current node to next node in list.
            this._current_node.index++;

            // Process the variable declaration.
            this._variable_declarator(this._current_node.declarations[this._current_node.index - 1]);
        } 
        else
        {
            // Set parent node.
            this._current_node = this._current_node.parent;

            // Process statements.
            this._statement();
        }    
    };
    
    parser._statement = function()
    {
        // Select the proper statement.
        switch(this._current_node.type)
        { 
            case 'BlockStatement':
                this._block_statement();
            break;
            case 'ExpressionStatement':
                this._expression_statement();
            break;    
            case 'VariableDeclaration':
                this._variable_declaration();
            break; 
            default:
                this._program();
        }
    };

    /*
     * Definition of private methods - program.
     */

    parser._program = function()
    {
        // Initialize index counter only the fitst time.
        this._current_node.index = (typeof this._current_node.index === 'undefined') ? 0 : this._current_node.index; 
        
        // Check if all nodes in script have been processed.
        if (this._current_node.index < this._current_node.body.length)		
	{
            // Set current node to next node in list.
            this._current_node.index++;
            this._current_node.body[this._current_node.index - 1].parent = this._current_node;
            this._current_node = this._current_node.body[this._current_node.index - 1];

            // Return to the node processessor.
            this._statement();
        }
        else
        {
            // All nodes are processed, set status to finished.
            this._status = 2;
        
            // Complete the inline item.    
            if (this._inline_script != null)
            {    
                this._inline_script.complete();
            }    
        } 
    }; 

    /*
     * Definition of private methods - statements
     */

    parser._runstatement = function(pNode)
    {
        // Call the expression statement en return the value.       
        return this._node_call_expression(pNode.expression);
    };
    
    parser._run = function(pInline_script, pAst_tree)
    {
	// Set the ast_tree. 
	this._inline_script = pInline_script;
	
	// Set the programm node.
	this._current_node = pAst_tree;
        
    	// Process the next node. 
	osweb.parser._program();
    };

    // Bind the parser class to the osweb namespace.
    osweb.parser = parser;
}()); 
