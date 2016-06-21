
/*
 * Definition of the class debug.
 */

(function() 
{
    function debug() 
    {
    	throw "The class debug cannot be instantiated!";
    }

    // Definition of public properties.
    debug.enabled    = false;
    debug.error      = false;
    debug.messageLog = new Array();

    /*
     * Definition of class methods.               
     */

    debug._initialize = function()
    {
    	// Clear the log.
    	this.messageLog = [];
    };	

    debug._finalize = function()
    {
	// If enabled add the log to the javascript console.
	if (this.enabled == true)
	{
            console.log(this.messageLog);			
	}

	// Clear the log.
	this.messageLog = [];
    };

    /*
     * Definition of the public methods.               
     */

    debug.addError = function(pErrorText)
    {
    	// Set the error flag.
    	this.error = true;

        // Show the fatal error warning.
	console.log(pErrorText);
	console.log(osweb.constants.ERROR_001);

	// throw the exception.
	throw new Error(pErrorText);	
    };
	
    debug.addMessage = function(pMessageText)
    {
        // Push the error message to the log.
	this.messageLog.push(pMessageText);		
	
	if (debug.enabled == true)
	{
            console.log(pMessageText);
        }    
    };

    debug.msg = function(pMessageText)
    {
	// Push the error message to the log.
	this.messageLog.push(pMessageText);		
	
	if (debug.enabled == true)
	{
            console.log(pMessageText);
        }    
    };

    // Bind the debug class to the osweb namespace.
    osweb.debug = debug;
}());

/*
 * Definition of the class file_pool_store.
 */

(function() 
{
    function file_pool_store()
    {
    	throw "The class file_pool_store cannot be instantiated!";
    }; 
	
    // Definition of private class properties.
    file_pool_store._data  = [];
    file_pool_store._items = [];  
	
    /*
     * Definition of private class methods.   
     */

    file_pool_store.add_from_local_source = function(pItem)
    {
        var ext = pItem.filename.substr(pItem.filename.lastIndexOf('.') + 1);
        
        if ((ext == 'jpg') || (ext == 'png'))
	{
            // Create a new file pool mage item.
            var img = new Image();
            img.src = pItem.toDataURL();
            var item = {data: img, folder: pItem.filename, name: pItem.filename.replace(/^.*[\\\/]/, ''), size: pItem.length, type: 'image'};
	}
        else if ((ext == 'wav') || (ext == 'ogg'))
	{
            var ado = new Audio();
            ado.src = pItem.toDataURL();
            var item = {data: ado, folder: pItem.filename, name: pItem.filename.replace(/^.*[\\\/]/, ''), size: pItem.length, type: 'sound'};
	}
	else if (ext == 'ogv')
        {
            var ado = document.createElement("VIDEO");
            ado.src = pItem.toDataURL();
            var item = {data: ado, folder: pItem.filename, name: pItem.filename.replace(/^.*[\\\/]/, ''), size: pItem.length, type: 'video'};
        }    
        
	// Add the item to the pool.
	this._items.push(item);

	// Link the item as property
	this[item.name] = item;
    };

    file_pool_store.add_from_server_source = function(pPath, pFiles)
    {
        console.log('--');
        console.log(pFiles);

        // Check if there are stimuli files.
        if (pFiles.length > 0)
	{
            // Set the preloader.
            this._queue = new createjs.LoadQueue(false);
            createjs.Sound.registerPlugins([createjs.HTMLAudioPlugin]);  // need this so it doesn't default to Web Audio
            this._queue.installPlugin(createjs.Sound);
 		
            this._queue.on("fileload", this._file_complete, this);
            this._queue.on("complete", this._load_complete, this);

            // Add the stimuli information to the loader.
            for (var i=0;i < pFiles.length;i++)
            {
                var re = /(?:\.([^.]+))?$/;
                var extention = re.exec(pFiles[i]);
                console.log(extention);
                
                if (extention[0] == '.ogg')
                {
                    console.log('sound');
                    this._queue.loadFile({id: pFiles[i], src: pPath + pFiles[i], type: createjs.AbstractLoader.SOUND});
                }    
                else
                { 
                    this._queue.loadFile({id: pFiles[i], src: pPath + pFiles[i], type: createjs.AbstractLoader.IMAGE});
                }        
            }
	
            // Load the stimuli files.
            this._queue.load();
        }
        else
        {
            // Build the experiment objects using the given script.
            osweb.runner._buildExperiment();
        } 
    }; 
    
    file_pool_store._file_complete = function(pEvent)
    {
	// Update the loader text.
	osweb.runner._updateIntroScreen(osweb.constants.MESSAGE_007);

        // Push the stimulus item to the stimuli object.
        var item = {data: pEvent.result, folder: pEvent.item.id, name: pEvent.item.id.replace(/^.*[\\\/]/, ''), size: pEvent.item.id, type: 'image'};
        
        // Add the item to the pool.
	this._items.push(item);

	// Link the item as property
	this[item.name] = item;
    };	
	
    file_pool_store._load_complete = function()
    {
	// Update the loader text.
	osweb.runner._updateIntroScreen(osweb.constants.MESSAGE_006);

        console.log(this._items);

	// Building is done, go to next phase.
        osweb.runner._buildExperiment();
    };	

    /*
     * Definition of public class methods.   
     */

    file_pool_store.add = function(pPath, pNew_Name)
    {
    	// Copies a file to the file pool. 
    };
	
    file_pool_store.fallback_folder = function()
    {	
    	// The full path to the fallback pool folder.
    };
	
    file_pool_store.files = function()
    {
    	// Returns all files in the file pool.
    };

    file_pool_store.folder = function()
    {
    	// The full path to the (main) pool folder.
    };
	
    file_pool_store.folders = function()
    {
    	// Gives a list of all folders that are searched when retrieving the full path to a file. 
    };

    file_pool_store.in_folder = function(pPath)
    {
    	// Checks whether path is in the pool folder. 
    };

    file_pool_store.rename = function(pOld_path, pNew_path)
    {
	// Renames a file in the pool folder.
    };
	
    file_pool_store.size = function()
    {
	// The combined size in bytes of all files in the file pool.
    };

    // Bind the stack file_pole_store to the osweb namespace.
    osweb.pool = file_pool_store;
}());

/*
 * Definition of the class functions.
 */

(function() 
{
    function functions() 
    {
	throw "The class functions cannot be instantiated!";
    }

    /*
     * Definition of general function methods.   
     */

    functions._initialize = function()
    {
	window['print']		 = this.print;
	window['randint']        = this.randint;
        
	// Create the global function calls for use in the inlide script item.
	window['canvas']         = this.canvas;
	window['copy_sketchpad'] = this.copy_sketchpad;
	window['keyboard']       = this.keyboard;
	window['mouse']          = this.mouse;
	window['pause']          = this.pause;
	window['reset_feedback'] = this.reset_feedback;	
	window['sampler']        = this.sampler;
	window['set_response']   = this.set_response;
	window['set_subject_nr'] = this.set_subject_nr;	
	window['sometimes']      = this.sometimes;
	window['synth'] 	 = this.synth;
	window['xy_circle'] 	 = this.xy_circle;
	window['xy_distance'] 	 = this.xy_distance;
	window['xy_from_polar']  = this.xy_from_polar;
	window['xy_grid'] 	 = this.xy_grid;
	window['xy_random'] 	 = this.xy_random;
	window['xy_to_polar']    = this.xy_to_polar;
    };
		
    /*
     * Definition of general function methods.   
     */

    functions.print = function(pString)
    {
	console.log('print output:' + pString);
    };

    functions.randint = function(pStart, pEnd)
    {
        var multiplier = pEnd - pStart;
        var rand = Math.floor(Math.random() * multiplier);
        return rand + pStart;
    };

    /*
     * Definition of general function methods.   
     */

    functions.canvas = function(pAuto_prepare, pStyle_args)
    {
        console.log('warning: function "canvas" not available yet.');
    };

    functions.copy_sketchpad = function(pName)
    {
        console.log('warning: function "copy_sketchpad" not available yet.');
    };

    functions.keyboard = function(pResp_args)
    {
        console.log('warning: function "keyboard" not available yet.');
    };

    functions.mouse = function(pResp_args)
    {
        console.log('warning: function "mouse" not available yet.');
    };

    functions.pause = function()
    {
        console.log('warning: function "pause" not available yet.');
    };

    functions.reset_feedback = function()
    {
        console.log('warning: function "reset_feedback" not available yet.');
    };

    functions.sampler = function(pSrc, pPlayback_args)
    {
        console.log('warning: function "sampler" not available yet.');
    };

    functions.set_response = function(pResponse, pResponse_time, pCorrect)
    {
        console.log('warning: function "set_response" not available yet.');
    };
	
    functions.set_subject_nr = function(pNr)
    {
        console.log('warning: function "set_subject_nr" not available yet.');
    };

    functions.sometimes = function(pP)
    {
        console.log('warning: function "sometimes" not available yet.');
    };

    functions.synth = function(pOsc, pFreq, pLength, pAttack, pDecay)
    {
        console.log('warning: function "synth" not available yet.');
    };

    functions.xy_circle = function(pN, pRho, pPhi0, pPole)
    {
        console.log('warning: function "xy_circle" not available yet.');
    };

    functions.xy_distance = function(pX1, pY1, pX2, pY2)
    {
        console.log('warning: function "xy_distance" not available yet.');
    };

    functions.xy_from_polar = function(pRho, pPhi, pPole)
    {
        console.log('warning: function "xy_from_polar" not available yet.');
    };

    functions.xy_grid = function(pN, pSpacing, pPole)
    {
        console.log('warning: function "xy_grid" not available yet.');
    };

    functions.xy_random = function(pN, pWidth, pHeight, pMin_dist, pPole)
    {
        console.log('warning: function "xy_random" not available yet.');
    };

    functions.xy_to_polar = function(pX, pY, pPole)
    {
        console.log('warning: function "xy_to_polar" not available yet.');
    };

    // Bind the functions class to the osweb namespace.
    osweb.functions = functions;
}()); 

/*
 * Definition of the class heartbeat.
 */

(function() 
{
    function heartbeat(pExperiment, pInterval)
    {
        // Set the class public properties. 
    	this.experiment = pExperiment;
	this.interval   = (typeof pInterval === 'undefined') ? 1 : pInterval;	
    }; 
	
    // Extend the class from its base class.
    var p = heartbeat.prototype;
    
    // Define the class public properties. 
    p.experiment = null;
    p.interval   = -1;

    /*
     * Definition of class private methods.   
     */

    p.beat = function()
    {
    };

    p.run = function()
    {
    };

    p.start = function()
    {
    };
	
    // Bind the heartbeat class to the osweb namespace.
    osweb.heartbeat = heartbeat;
}());

/*
 * Definition of the class item_stack.
 */

(function() 
{
    function item_stack()
    {
   	throw "The class item_stack cannot be instantiated!";
    }; 
	
    // Definition of private class properties.
    item_stack._items = [];  
	
    /*
     * Definition of public class methods.   
     */

    item_stack.clear = function()
    {
    	// Clears the stack.
	this._items = [];
    };

    item_stack.push = function(pItem, pPhase)
    {
    	// Create the stack item.
	var StackItem = {'item': pItem, 'phase': pPhase};

	// Push the item onto the stack.
	this._items.push(StackItem);
    };	

    item_stack.pop = function()
    {
	// Pops the last item from the stack.
	return this._items.pop();
    };

    // Bind the item_stack class to the osweb namespace.
    osweb.item_stack = item_stack;
}());

/*
 * Definition of the class item_store.
 */

(function() 
{
    function item_store()
    {
	throw "The class item_store cannot be instantiated!";
    } 
		
    // Set the class private properties. 
    item_store._experiment = null;
    item_store._items      = {};
    
    /*
     * Definition of public methods - running item.         
     */
    
    item_store.execute = function(pName, pParent)
    {
	// Executes the run and prepare phases of an item, and updates the item stack.
	this.prepare(pName);
	this.run(pName, pParent);
    };

    item_store.items = function()
    {
	// Create a list o keys.
        var items = [];
        for (var key in this._items) 
        {
            items.push([key ,this._items[key]]);
        }    
        
        // Returns a list of item names.
	return items;
    };

    item_store.keys = function()
    {
	// Create a list o keys.
        var keys = [];
        for (var key in this._items) 
        {
            keys.push(key);
        }    
        
        // Returns a list of item names.
	return keys;
    };

    item_store.new = function(pType, pName, pScript)
    {
	// Check if the element is part of the osweb name space
	if (osweb.isClass(pType) == true)
	{
            // Add the new item as property of items.
            this._items[pName] = osweb.newItemClass(pType, this._experiment, pName, pScript);
        }
	else
	{
            // Unkwone class definition, show error message.
            osweb.debug.addError(osweb.constants.ERROR_009 + pType);
	}
    };
    
    item_store.prepare = function(pName)
    {
        // Executes the prepare phase of an item, and updates the item stack.
	osweb.item_stack.push(pName, 'prepare');
	this._items[pName].prepare();
	osweb.item_stack.pop();
    };	

    item_store.run = function(pName, pParent)
    {
	// Set the current and its parent item.
	osweb.events._current_item         = this._items[pName];
	osweb.events._current_item._parent = pParent;
		
	// Executes the run phase of an item, and updates the item stack.
	osweb.item_stack.push(pName, 'run');
	this._items[pName].run();
    };

    item_store.valid_name = function(pItem_type, pSuggestion)
    {
        // Check the optional parameters.
        pSuggestion = (typeof pSuggestion === 'undefined') ? null : pSuggestion;
        
        if (pSuggestion == null)
        {
            var name = 'new_' + pItem_type;
        }
        else
        {
            var name = this._experiment.syntax.sanitize(pSuggestion, true, false);
        }   
        
        // Create a unique name.
        var i     = 1;
        var _name = name;
        while (this._items.hasOwnProperty(_name) == true)
        {
            _name = name + '_' + String(i);
	    i++;
        } 

        // Return function result
        return _name; 
    };    
    
    item_store.values = function()
    {
  	// Create a list o keys.
        var values = [];
        for (var key in this._items) 
        {
            values.push(this._items[key]);
        }    
        
        // Returns a list of item names.
	return values;
    };

    // Bind the item_store class to the osweb namespace.
    osweb.item_store = item_store;
}());

/*
 * Definition of the class prng.
 */

(function() 
{
    function prng()
    {
    	throw "The class prng cannot be instantiated!";
    }; 
	
    // Set the class private properties. 
    prng._previous = 0;
    prng._prng     = uheprng();    
    prng._seed     = '0';

    /*
     * Definition of class methods - run cycle.   
     */
    
    prng._initialize = function()
    {
        // Create the random seed. 
        this._prng.initState();
        this._prng.hashString(this._seed); 
    };

    /*
     * Definition of class methods.   
     */

    prng._getNext = function() 
    {
        // Get the next random number.
        this._previous = (this._prng(1000000000000000) / 1000000000000000);
        
        // Return function result.
        return this._previous;
	};

    prng._getPrevious = function() 
    {
        // Return function result.
        return this._previous;
    };

    prng._getSeed = function() 
    {
        // Return the current seed value.
        return this._seed;        
    };

    prng._random = function(pMin, pMax) 
    {
        // Calculate the range devider.
        var devider = (1 / ((pMax - pMin) + 1));
         
        // Get the random number and devide it.
        this._previous = ((this._prng(1000000000000000) / 1000000000000000));
        
        // Set the devider.
        this._previous = pMin + Math.floor(this._previous / devider);
               
        // Return function result. 
        return this._previous;
    };

    prng._reset = function() 
    {
        // Set the random seed value to 0. 
        this._seed = '0';

        // Reset the PRNG range.
        this._prng.initState();
        this._prng.hashString(String(this._seed));
    };
    
    prng._setSeed = function(pSeed) 
    {
        // Set the random seed value. 
        this._seed = String(pSeed);
        
        // Reset the PRNG range.
        this._prng.initState();
        this._prng.hashString(this._seed);
    };

    // Bind the prng class to the osweb namespace.
    osweb.prng = prng;
}());

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
 
/*
 * Definition of the class syntax.
 */

(function() 
{
    function syntax()
    {
    	throw "The class syntax cannot be instantiated!";
    }; 

    /*
     * Definition of private class methods.   
     */

    syntax._convertPython = function(pScript)
    {
    	return pScript;
    };

    syntax.isNumber = function(n)
    {
        return Number(n) == n;
    };

    syntax.isFloat = function(n)
    {
        return Number(n) === n && n % 1 !== 0;
    };

    syntax.remove_quotes = function(pString)
    {
	if ((pString[0] == '"') && (pString[pString.length - 1] == '"'))
	{
            return pString.slice(1, pString.length - 1);
	}
	else
	{
            return pString;
	}	
    };

    /*
     * Definition of public class methods.   
     */
    
    syntax.compile_cond = function(pCnd, pBytecode)
    {
	// Check for conditional paramters.
	pBytecode = (typeof pBytecode === 'undefined') ? true : pBytecode;	
		
	if (pCnd == 'always')
	{
            return true;
	} 
	else if (pCnd == 'never')
	{
            return false;
	} 
        else
	{
            if (pCnd.substring(0,1) == '=')
            {
                // Python script, compile it to an ast tree.
                console.log('python script is not supported yet');
            } 
            else
            {
                // opensesame script, convert it to javascript.
                pCnd = pCnd.replace(/[^(!=)][=]/g, '==');
            }
        }    

        return pCnd;
    };
	
    syntax.eval_text = function(pTxt, pVars, pRound_float, pVar)
    {
	// Evaluates variables and inline Python in a text string.
	var result     = pTxt;
	var processing = result.search(/[^[\]]+(?=])/g);
		
	while (processing != -1)
	{
            // Replace the found value with the variable.
            var variable = result.slice(processing,result.indexOf(']'));
           
            if (typeof pVars === 'undefined')
            {
                var value = osweb.runner.experiment.vars[variable];
            }
            else
            {
                var value = pVars[variable];
            } 
            
            result	 = result.replace('[' + variable + ']',value);			
            processing   = result.search(/[^[\]]+(?=])/g);
        }

        return result;
    };

    syntax.parse_cmd = function(pString)
    {
	// split the astring.
	var tokens = this.split(pString);
	tokens.shift();
	tokens.shift();
	return tokens;
    };

    syntax.sanitize = function(pString, pStrict, pAllowVars)
    {
	// Removes invalid characters (notably quotes) from the string.
	return pString;
    };

    syntax.split = function(pLine)
    {
    	// Return an array with tokens ignoring whitespaces within. 
	var result = pLine.match(/(?:[^\s"]+|"[^"]*")+/g);
        
        return (result != null) ? result : [];
    };    

    // Bind the syntax class to the osweb namespace.
    osweb.syntax = syntax;
}());

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
