
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

    /*
     * Definition of private methods - AST parsing   
     */

    parser._node_identifier = function(pNode, pType)
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

    parser._process_node = function()
    {
	console.log(this._current_node);
        // Set the parser status.
        switch (this._current_node.type)
	{
            case 'Program':
		if (this._current_node.index < this._current_node.body.length)		
		{
                    this._current_node.index++;
                    this._current_node.body[this._current_node.index - 1].parent = this._current_node;
                    this._current_node = this._current_node.body[this._current_node.index - 1];

                    // Set the parser status.
                    this._process_node();
                }
                else
                {
                    // End the parser.
                    this._status = 2;
        
                    // Complete the inline item.    
                    parser._inline_script.complete();
                } 
            break; 
            case 'BlockStatement':
                // Process a variable declarator.
                this._node_block_expression(this._current_node);
            break;		
            case 'EmptyStatement':
                // Set parent node.
                this._current_node = this._current_node.parent;

                // Set the parser status.
                this._process_node();
            break
            case 'ExpressionStatement':
                // Process a variable declarator.
                this._node_expression_statement(this._current_node);
            break;		
            case 'VariableDeclaration':
                // Process a variable declarator.
                this._node_variable_declarator(this._current_node.declarations[0]);
            break; 
        }
    };

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
	this._current_node        = pAst_tree;
	this._current_node.parent = null;
	this._current_node.index  = 0;
	this._status              = 1;
        
    	// Process the next node. 
	osweb.parser._process_node();
    };

    // Bind the parser class to the osweb namespace.
    osweb.parser = parser;
}()); 
