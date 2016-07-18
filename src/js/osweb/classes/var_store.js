/*
 * Definition of the class var_store.
 */

(function() 
{
    function var_store(pItem, pParent)
    {
        // Set the class properties. 
        this._item   = pItem;
        this._parent = pParent;
    }; 
	
    // Extend the class from its base class.
    var p = var_store.prototype;
    
    // Set the class default properties. 
    p._item   = null;
    p._parent = null;        
	
    /*
     * Definition of public class methods.   
     */

    p.get = function(pVar, pDefault, pEval, pValid)
    {
	// Set the optional arguments
	pDefault = (typeof pDefault === 'undefined') ? null : pDefault;
	pEval    = (typeof pEval === 'undefined')    ? true : pEval;
	pValid   = (typeof pValid === 'undefined')   ? null : pValid;
		
	var value = null;

	// Gets an experimental variable.
	if (pVar in this)
	{
            if (typeof this[pVar] == 'string')
            {
	 	value = osweb.syntax.eval_text(this[pVar]);
            }
            else
            {
 		value = this[pVar];
            }
 	}

	// Return function result.
	return value;
    };

    p.inspect = function()
    {
	var keys = [];
	for(var key in this)
  	{
            keys.push(key);
   	}
   		
   	// Slide default properties. 
   	keys = keys.slice(2,keys.length - 3);
   		
	return keys;
    };

    p.set = function(pVar, pVal)
    {
	// Sets and experimental variable.
	this[pVar] = pVal;
    };
	
    // Bind the vars class to the osweb namespace.
    osweb.var_store = var_store;
}());
