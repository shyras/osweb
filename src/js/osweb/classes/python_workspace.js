
/*
 * Definition of the class python_workspace.
 */

(function() 
{
    function python_workspace()
    {
    	throw "The class python_workspace cannot be instantiated!";
    }; 
	
    /*
     * Definition of public class methods.   
     */
    
    python_workspace._eval = function(pBytecode)
    {
        // Check wich type of expression must be evaled.
        if (typeof pBytecode === 'boolean')    
        {
            return pBytecode;
        }
        else if (typeof pBytecode === 'string')
        {
            // Open sesame script, first check for paramter values. 
            pBytecode = osweb.syntax.eval_text(pBytecode);

            // Evaluate the expression.
            return eval(osweb.syntax.remove_quotes(pBytecode));    
        }
        else
        {
            console.log('>python script - not supported yet');
            return eval(pBytecode);
        }    
    };
	
    python_workspace.init_globals = function()
    {
    };
	
    // Bind the python_workspace class to the osweb namespace.
    osweb.python_workspace = python_workspace;
}());
