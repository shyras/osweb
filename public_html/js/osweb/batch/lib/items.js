	
/*
 * Definition of the class item.
 */

(function() 
{
    function item(pExperiment, pName, pScript)
    {
	// Set the class private properties.
	this._get_lock = null;
	this._parent   = null;
	this._status   = osweb.constants.STATUS_NONE;

        // Set the class public properties.
	this.count      = 0;	
	this.debug	= osweb.debug.enabled;
	this.experiment = (pExperiment == null) ? this : pExperiment;
	this.name       = pName;	
	this.vars 	= (this.vars) ? this.vars : new osweb.var_store(this, null);

        // Set the object realted properties.
	this.clock            = this.experiment._clock;		
	this.log              = this.experiment._log;
	this.python_workspace = this.experiment._python_workspace;	
        this.syntax           = this.experiment._syntax; 	
	
        // Read the item definition string.	
	this.from_string(pScript);
    } 
	
    // Extend the class from its base class.
    var p = item.prototype;

    // Definition of class public properties. 
    p.clock            = null;
    p.comments         = null;
    p.count            = 0;
    p.debug            = false;
    p.experiment       = null;
    p.log              = null;
    p.name             = '';
    p.syntax           = null;
    p.python_workspace = null;
    p.vars             = null;
    p.variables        = null;

    /*
     * Definition of public methods - general function.
     */

    p.dummy = function()
    {
    	// Dummy function, continue execution of an item directly.
    };
   
    p.resolution = function()
    {
    	/* // Returns the display resolution and checks whether the resolution is valid.
        var w = this.vars.get('width');
	var h = this.vars.get('height');
	if ((typeof w !== 'number') || (typeof h !== 'number'))
	{
            osweb.debug.addError('(' + String(w) + ',' + String(h) + ') is not a valid resolution');
        }
        
        return [w, h]; */
    };
   
    p.set_response = function(pResponse, pResponse_time, pCorrect)
    {
	// Processes a response in such a way that feedback variables are updated as well.
        console.log('warning: method "item.set_response" not implemented yet.');
    };
 
    p.sleep = function(pMs)
    {
	// Pauses the object execution. !WARNING This function can not be implemented due the script blocking of javascript.
	this.clock.sleep(pMs);
    };

    p.time = function()
    {
	// Returns the current time.
    	return this.clock.time();
    };

     /*
     * Definition of public methods - build cycle.         
     */

    p.from_string = function(pString)
    {
	// Parses the item from a definition string.
	osweb.debug.addMessage('');
        this.variables = {};
	this.reset();
	this.comments = [];
	this.reset();
		
	// Split the string into an array of lines.  
	if (pString != null)
	{
            var lines = pString.split('\n');
            for (var i=0; i < lines.length; i++)
            {
                if ((lines[i] != '') && (this.parse_variable(lines[i]) == false))
		{
                   
                    this.parse_line(lines[i]);
                }
            }
	}					
    };
	
    p.parse_comment = function(pLine)
    {
	// Parses comments from a single definition line, indicated by # // or '.
	pLine = pLine.trim();
	if ((pLine.length > 0) && (pLine.charAt(0) == '#'))
	{
            // Add comments to the array removing the first character.
            this.comments.push(pLine.slice(1));

            return true;
	}	
	else if ((pLine.length > 1) && (pLine.charAt(0) == '/'))
	{
            // Add comments to the array removing the first two characters.
            this.comments.push(pLine.slice(2));
            
            return true;			
	}
	else
	{
            return false;
	}
    };	
	
    p.parse_keyword = function(pLine, pFrom_ascii, pEval)
    {
    };

    p.parse_line = function(pLine)
    {
	// Allows for arbitrary line parsing, for item-specific requirements.
    };

    p.parse_variable = function(pLine)
    {
        // Reads a single variable from a single definition line.
        if (this.parse_comment(pLine))
        {
            return true;
        }
        else
        {
            var tokens = osweb.syntax.split(pLine);
            if ((tokens != null) && (tokens.length > 0) && (tokens[0] == 'set'))
            {
		if (tokens.length != 3)
		{
                    osweb.debug.addError('Error parsing variable definition: ' + pLine);
		}	
            	else
		{
                    // Rettrieve the value of the variable, remove additional quotes.
                    var value = osweb.syntax.remove_quotes(tokens[2]);

                    // Check for number types.
                    value = osweb.syntax.isNumber(value) ? Number(value) : value;
                    
                    this.vars.set(tokens[1], value);

                    return true;
		}
            }
            else
            {
		return false;
            }
        }	
    };
	
    /*
     * Definition of public methods - runn cycle. 
     */
    
    p.reset = function()
    {
	// Resets all item variables to their default value.
    };

    p.prepare = function()
    {
	// Implements the prepare phase of the item.
	this.experiment.vars.set('count_' + this.name, this.count);
	this.count++;
		
	// Set the status to initialize.
	this._status = osweb.constants.STATUS_INITIALIZE;
    	
        // For debugging.
        osweb.debug.addMessage('prepare' + this.name);
        
        // Implements the complete phase of the item (to support blocking script in the prepare phase).
	if ((this._parent !== null) && (this.type !== 'feedback'))
	{
            // Prepare cycle of parent.
            this._parent.prepare_complete();
        }
    };

    p.prepare_complete = function()
    {
        // Dummy function for completion process.
    };

    p.set_item_onset = function(pTime)
    {
 	// Set a timestamp for the item's executions
	var time = (pTime != null) ? pTime : this.clock.time();
	this.experiment.vars.set('time_' + this.name, time);
    };	

    p.run = function()
    {
    	// Implements the run phase of the item.
        osweb.debug.addMessage('run' + this.name);
    };

    p.update = function()
    {
    	// Implements the update phase of the item.
    };
    
    p.update_response = function(pResponse)
    {
	// Implements the update_response phase of an item.
    };	

    p.complete = function()
    {
    	// Implements the complete phase of the item.
	if (this._parent !== null)
	{
            // Return the process control to the parent of the element.
            osweb.events._current_item = this._parent;
            osweb.events._current_item.run();  
	}
    };
  
    // Bind the item class to the osweb namespace.
    osweb.item = item;
}());

/*
 * Definition of the class generic_response.
 */

(function() 
{
    function generic_response(pExperiment, pName, pScript)
    {
	// Inherited create.
	this.item_constructor(pExperiment, pName, pScript);
	
	// Definition of private properties.
	this._allowed_responses = null;
	this._duration          = 0;
	this._duration_func 	= null;
	this._keyboard		= null;
	this._mouse             = null;
	this._responsetype	= osweb.constants.RESPONSE_NONE;
	this._timeout           = -1;
    }; 
	
    // Extend the class from its base class.
    var p = osweb.extendClass(generic_response, osweb.item);

    // Definition of public properties.
    p.auto_response    = "a";
    p.process_feedback = false;
    p.synonyms         = null;
  
    /*
     * Definition of public methods - build cycle. 
     */

    p.auto_responser = function()
    {
    };

    p.auto_responser_mouse = function()
    {
    };

    p.prepare_allowed_responses = function()
    {
        // Prepare the allowed responses..
        if (this.vars.get('allowed_responses') == null)
	{
            this._allowed_responses = null;
	}
	else
	{	
            // Create a list of allowed responses that are separated by semicolons. Also trim any whitespace.
            var allowed_responses = String(this.vars.allowed_responses).split(';');
            
            if (this.vars.duration == 'keypress')
            {	
		//this._allowed_responses = allowed_responses;
                this._allowed_responses = this._keyboard._get_default_from_synoniem(allowed_responses);
            }
            else if (this.vars.duration == 'mouseclick')
            {
                // For mouse responses, we don't check if the allowed responses make sense.
            	this._allowed_responses = this._mouse._get_default_from_synoniem(allowed_responses);
            }
            
            // If allowed responses are provided, the list should not be empty.
            if (this._allowed_responses.length == 0)
            {
		osweb.debug.addError(this.vars.get('allowed_responses') + ' are not valid allowed responses in keyboard_response '+ this.name);	
            } 
	}
    };
		
    p.prepare_duration = function()
    {
	// Prepare the duration.
	if (this.vars.get('duration') != null)
	{
            if (typeof this.vars.duration == 'number')
            {
		// Prepare a duration in milliseconds
		this._duration = this.vars.duration;
		if (this._duration == 0)
		{
                    this._responsetype = osweb.constants.RESPONSE_NONE;
		}
		else
		{	
                    this._responsetype = osweb.constants.RESPONSE_DURATION;
		}
            }
            else
            {
		this._duration = -1;
		if (this.vars.duration == 'keypress')
		{
                    this.prepare_duration_keypress();
                    this._responsetype = osweb.constants.RESPONSE_KEYBOARD;
		}
		else if (this.vars.duration == 'mouseclick')
		{
                    this.prepare_duration_mouseclick();
                    this._responsetype = osweb.constants.RESPONSE_MOUSE;
		}
                else if (this.vars.duration == 'sound')
                {
                    this._responsetype = osweb.constants.RESPONSE_SOUND;
                } 
                else if (this.vars.duration == 'video')
                {
                    this._responsetype = osweb.constants.RESPONSE_VIDEO;
                } 
            }		
	}
    };
	
    p.prepare_duration_keypress = function()
    {
        // Prepare a keyboard duration.
	this._keyboard = new osweb.keyboard(this.experiment);
	if (this.experiment.auto_response == true)
	{
            this._duration_func = this.auto_responder;
	}
	else
	{
            var final_duration = (this._timeout != -1) ? this._timeout : this._duration;
            this._keyboard.set_config(final_duration, this._allowed_responses);
	}
    };
	
    p.prepare_duration_mouseclick = function(self)
    {
	// Prepare a mouseclick duration.
	this._mouse = new osweb.mouse(this.experiment);
	if (this.experiment.auto_response == true)
	{
            this._duration_func = this.auto_responder_mouse;
	}
	else
	{
            var final_duration = (this._timeout != -1) ? this._timeout : this._duration;
            this._mouse.set_config(final_duration, this._allowed_responses, false);
	}
    };	

    p.prepare_timeout = function()
    {
	// Prepare the timeout.
	if (this.vars.get('timeout') != null) 
	{
            if (typeof this.vars.timeout == 'number')
            {
		// Prepare a duration in milliseconds
            	this._timeout = this.vars.timeout;
            }
            else
            {
		this._timeout = -1;
            }		
	}
    };	
    
    /*
     * Definition of public methods - run cycle. 
     */

    p.process_response_keypress = function(pRetval)
    {
	this.experiment._start_response_interval = this.sri;
	this.experiment._end_response_interval   = pRetval.rtTime;
	this.experiment.vars.response            = this.syntax.sanitize(pRetval.resp);
	this.synonyms                            = this._keyboard.synonyms(this.experiment.vars.response); 
	this.response_bookkeeping();
    };
	
    p.process_response_mouseclick = function(pRetval)
    {
 	this.experiment._start_response_interval = this.sri;
	this.experiment._end_response_interval   = pRetval.rtTime;
	this.experiment.vars.response		 = pRetval.resp;
	this.synonyms                            = this._mouse.synonyms(this.experiment.vars.response);
	this.experiment.vars.cursor_x            = pRetval.event.clientX;
	this.experiment.vars.cursor_y            = pRetval.event.clientY;
	this.response_bookkeeping();
    };

    p.response_bookkeeping = function()
    {
	// The respone and response_time variables are always set, for every response item
	this.experiment.vars.set('response_time', this.experiment._end_response_interval - this.experiment._start_response_interval);
	this.experiment.vars.set('response_' + this.name, this.experiment.vars.get('response'));
	this.experiment.vars.set('response_time_' + this.name, this.experiment.vars.get('response_time'));
	this.experiment._start_response_interval = null;

	// But correctness information is only set for dedicated response items, such as keyboard_response items, because otherwise we might confound the feedback
	if (this.process_feedback == true)
	{
            // debug.msg(u"processing feedback for '%s'" % self.name)
            if (this.vars.correct_response != null)
            {
                // If a correct_resbponse has been defined, we use it to determine accuracy etc.
		if (this.synonyms != null)  
		{
                    if (this.synonyms.indexOf(String(this.vars.get('correct_response'))) != -1)
                    { 
                        this.experiment.vars.correct       = 1;
			this.experiment.vars.total_correct = this.experiment.vars.total_correct + 1;
                    }
                    else
                    {
                        this.experiment.vars.correct = 0;
                    }
		}	
		else
		{
                    this.experiment.vars.correct = 'undefined';
                    /* if self.experiment.response in (correct_response, safe_decode(correct_response)):
                    	self.experiment.var.correct = 1
			self.experiment.var.total_correct += 1
                    else:
                    	self.experiment.var.correct = 0 */
		}
            }
            else
            {
                // If a correct_response hasn't been defined, we simply set correct to undefined.
		this.experiment.vars.correct = 'undefined';
            }	

            // Do some response bookkeeping
            this.experiment.vars.total_response_time   = this.experiment.vars.total_response_time + this.experiment.vars.response_time;
            this.experiment.vars.total_responses       = this.experiment.vars.total_responses + 1;
            this.experiment.vars.accuracy              = Math.round(100.0 * this.experiment.vars.total_correct / this.experiment.vars.total_responses);
            this.experiment.vars.acc        	       = this.experiment.vars.accuracy;
            this.experiment.vars.average_response_time = Math.round(this.experiment.vars.total_response_time / this.experiment.vars.total_responses);
            this.experiment.vars.avg_rt                = this.experiment.vars.average_response_time;
            this.experiment.vars.set('correct_' + this.name, this.vars.correct); 
	} 
   };	
	
   p.process_response = function()
   {
   	// Start stimulus response cycle.
   	switch (this._responsetype)
   	{
            case osweb.constants.RESPONSE_NONE:
 		// Duration is 0, so complete the stimulus/response cycle.
 		this._status = osweb.constants.STATUS_FINALIZE;
                this.complete();
           
            break;
            case osweb.constants.RESPONSE_DURATION:
		this.sleep_for_duration();
            
            break;
            case osweb.constants.RESPONSE_KEYBOARD:
                this._keyboard.get_key();
            
            break;
            case osweb.constants.RESPONSE_MOUSE:
                this._mouse.get_click();
            
            break;
            case osweb.constants.RESPONSE_SOUND:
               this._sampler.wait();

            break;
            case osweb.constants.RESPONSE_VIDEO:
               this._video.wait();
            
            break;
   	}		
    };

    p.set_sri = function(pReset)
    {
	// Sets the start of the response interval.
	if (pReset == true)
	{
            this.sri = self.vars.get('time_' + this.name);
            this.experiment._start_response_interval = this.vars.get('time_' + this.name);
	}
	
	if (this.experiment._start_response_interval == null)
	{
            this.sri = this.experiment.vars.get('time_' + this.name);
	}
	else
	{
            this.sri = this.experiment._start_response_interval;
	}
    };		

    p.sleep_for_duration = function()
    {
	// Sleep for a specified time.
	this.sleep(this._duration);		
    };
   
    /*
     * Definition of public methods - running item. 
     */
    
    p.prepare = function()
    {
	// Implements the prepare phase of the item.
	this.prepare_timeout();
	this.prepare_allowed_responses();
	this.prepare_duration();
    
        // Inherited.	
	this.item_prepare();
    };
    
    p.update_response = function(pResponse)
    {
        // Implements the update response phase of the item.
	if ((this._responsetype == osweb.constants.RESPONSE_KEYBOARD) && (pResponse.type == osweb.constants.RESPONSE_KEYBOARD)) 
	{
            this.process_response_keypress(pResponse);
	}
	else if ((this._responsetype == osweb.constants.RESPONSE_MOUSE) && (pResponse.type == osweb.constants.RESPONSE_MOUSE)) 
	{
            this.process_response_mouseclick(pResponse);     
	}
    }; 

    // Bind the generic_response class to the osweb namespace.
    osweb.generic_response = osweb.promoteClass(generic_response, "item");
}());

/*
 * Definition of the class experiment.
 */

(function() 
{
    function experiment(pExperiment, pName, pScript, pPool_folder, pExperiment_path, pFullscreen, pAuto_response, pLogfile, pSubject_nr, pWorkspace, pResources, pHeartbeat_interval)
    {
	// Set the items property for this experiment.
	osweb.item_store._experiment = this;

	// Set the optional arguments
	pLogfile = (typeof pLogfile === 'undefined') ? null : pLogfile;

	// Set the private properties. 
	this._end_response_interval   = null;
	this._start_response_interval = null;
	this._syntax                  = osweb.syntax;
	this._python_workspace        = (pWorkspace) ? pWorkspace : osweb.python_workspace;

	// Set the public properties. 
	this.auto_response      = (pAuto_response) ? pAuto_response : false;
	this.cleanup_functions  = [];
	this.heartbeat_interval = (pHeartbeat_interval) ? pHeartbeat_interval : 1;
	this.items              = osweb.item_store;
	this.output_channel 	= null;
	this.paused 		= false;
	this.plugin_folder 	= 'plugins';
	this.pool               = osweb.file_pool_store;
	this.resources 		= (pResources) ? pResources : {};
	this.restart 		= false;
	this.running		= false;
	this.vars               = new osweb.var_store(this, null);
		
	// Set default variables
	this.vars.start               = 'experiment';
	this.vars.title               = 'My Experiment';
	this.vars.bidi                = 'no';
	this.vars.round_decimals      = 2;
	this.vars.form_clicks         = 'no';
	this.vars.uniform_coordinates = 'no';

        // Sound parameters.
	this.vars.sound_freq          = 48000;
	this.vars.sound_sample_size   = -16; 
	this.vars.sound_channels      = 2;
	this.vars.sound_buf_size      = 1024;

	// Default backend
	this.vars.canvas_backend      = 'xpyriment';

	// Display parameters.
	this.vars.width               = 1024;
	this.vars.height              = 768;
	this.vars.background          = 'black';
	this.vars.foreground          = 'white';
	this.vars.fullscreen          = (pFullscreen) ? 'yes' : 'no';

	// Font parameters.
	this.vars.font_size           = 18;
	this.vars.font_family         = 'mono';
	this.vars.font_italic         = 'no';
	this.vars.font_bold 	      = 'no';
	this.vars.font_underline      = 'no'; 

	// Logfile parameters
	this.logfile = pLogfile;
	this.debug   = osweb.debug.enabled;

	// Create the backend objects.
	this._canvas = new osweb.canvas(this);
	this._clock  = new osweb.clock(this);
	this._log    = new osweb.log(this, this.logfile);
	
        // Set the global anchors.
        window['clock'] = this._clock;
        window['log']   = this._log;    
        
	// Inherited.
	this.item_constructor(pExperiment, pName, pScript);
    } 
	
    // Extend the class from its base class.
    var p = osweb.extendClass(experiment, osweb.item);
  
    // Definition of public properties. 
    p.auto_response      = false;
    p.cleanup_functions  = [];
    p.heartbeat_interval = 1;
    p.items              = null;
    p.output_channel     = null;
    p.paused             = false;
    p.plugin_folder      = '';
    p.pool               = null;
    p.resources          = null;
    p.restart            = false;
    p.running            = false;
  	
    /*
     * Definition of public methods - general function.
     */

    p.item_prefix = function()
    {
	// A prefix for the plug-in classes, so that [prefix][plugin] class is used instead of the [plugin] class.
	return '';		
    };

    p.reset_feedback = function()
    {
	// Resets the feedback variables (acc, avg_rt, etc.)."""
	this.vars.total_responses       = 0;
	this.vars.total_correct         = 0;
	this.vars.total_response_time   = 0;
	this.vars.avg_rt                = 'undefined';
	this.vars.average_response_time = 'undefined';
	this.vars.accuracy              = 'undefined';
	this.vars.acc                   = 'undefined';
    };

    p.set_subject = function(pNr)
    {
	// Sets the subject number and parity (even/ odd). This function is called automatically when an experiment is started, so you do not generally need to call it yourself.
	this.vars.subject_nr = pNr;
	if ((pNr % 2) == 0)
	{
            this.vars.subject_parity = 'even';
	}
	else
	{
            this.vars.subject_parity = 'odd';
	}
    };
  
    /*
     * Definition of public methods - building item.         
     */

    p.read_definition = function(pString)
    {
    	// Extracts a the definition of a single item from the string.
	var line = pString.shift();
	var def_str = '';
    	while ((line != null) && (line.length > 0) && (line.charAt(0) == '\t'))
	{
            def_str = def_str + line + '\n';
            line = pString.shift();
	}	
	return def_str;
    };	

    p.from_string = function(pString)
    {
    	// Set debug message.
	osweb.debug.addMessage('building experiment');
		
	// Split the string into an array of lines.  
	if (pString != null)
	{
            this._source = pString.split('\n');
            var l = this._source.shift();
            while (l != null)
            {
		// Set the processing of the next line.
		var get_next = true;

                try
		{
                    // Split the single line into a set of tokens.
                    var t = osweb.syntax.split(l);					
		}
		catch(e)
		{
                    // u"Failed to parse script. Maybe it contains illegal characters or unclosed quotes?", \
		}	

		if ((t != null) && (t.length > 0))
		{
                    // Try to parse the line as variable (or comment)
                    if (this.parse_variable(l) == false)
                    {
                        if (t[0] == 'define') 
			{
                            if (t.length == 3)
                            {
				// Get the type, name and definition string of an item.
				var item_type = t[1];
                                var item_name = osweb.syntax.sanitize(t[2]);
				var def_str = this.read_definition(this._source);
					
				osweb.item_store.new(item_type, item_name, def_str); 
                            }
                            else
                            {
                                // raise osexception(u'Failed to parse definition',line=line);
                            }
			}
                    }
		}

		// Get the next line.
		if (get_next == true)
		{
                    l = this._source.shift();
		}
            }
	};
    };
    
    /*
     * Definition of public methods - backends.
     */

    p.init_clock = function()
    {
	// Initializes the clock backend.
	this._clock.initialize;
    };	

    p.init_display = function()
    {
	// Initializes the canvas backend.
	this._canvas.init_display(this);

        this._python_workspace['win'] = window;
    };

    p.init_heartbeat = function()
    {
	// Initializes heartbeat.
	if ((this.heartbeat_interval <= 0) || (this.vars.fullscreen == 'yes') || (this.output_channel == null))
	{
            this.heartbeat = null;
	}
	else
	{
            this.heartbeat = new osweb.heartbeat(this, 1); 	
            this.heartbeat.start();
	}
    };	

    p.init_log = function()
    {
    	// Open a connection to the log file.
	this._log.open(this.logfile); 	
    };

    p.init_random = function()
    {
	// Initializes the random number generators. For some reason
	/* import random
	random.seed()
	try:
            # Don't assume that numpy is available
            import numpy
            numpy.random.seed()
            except:
            pass */
    };

    p.init_sound = function()
    {
	// Intializes the sound backend.
	/* from openexp import sampler
	sampler.init_sound(self) */
    };

    /*
     * Definition of public methods - running item.         
     */

    p.run = function()
    {
	// Inherited.	
	this.item_run();
	
	// Runs the experiment.
        switch (this._status)
        {
            case osweb.constants.STATUS_INITIALIZE:

                // Set the status to finalize.
		this._status = osweb.constants.STATUS_FINALIZE;

		// Save the date and time, and the version of OpenSesame
		this.vars.datetime            = new Date().toString();
		this.vars.opensesame_version  = osweb.VERSION_NUMBER; 
		this.vars.opensesame_codename = osweb.VERSION_NAME; 
		this.running = true;
		this.init_random();
		this.init_display();
		this.init_clock();
		this.init_sound();
		this.init_log();
		this.python_workspace.init_globals();
		this.reset_feedback();
		this.init_heartbeat(); 
	
		// Add closing message to debug system.
		osweb.debug.addMessage('experiment.run(): experiment started at ' + new Date().toUTCString()); 

		if (osweb.item_store._items[this.vars.start] != null)
		{
                    osweb.item_stack.clear();
                    osweb.item_store.prepare(this.vars.start, this);
                    //osweb.item_store.execute(this.vars.start, this);
		}
		else
		{
                    osweb.debug.addError('Could not find item ' + self.vars.start +  ' , which is the entry point of the experiment');
		}

            break;
            case osweb.constants.STATUS_FINALIZE:

		// Add closing message to debug system.
                osweb.debug.addMessage('experiment.run(): experiment finished at ' +  new Date().toUTCString());

		// Complete the run process.
		this.end();
	
            break;
        }; 
    };

    p.end = function()
    {
	this.running = false;
	
	//this._log.flush();
	this._log.close();
		
	// Disable the processing unit.
	osweb.events._current_item = null;
	
	// Clear the exprimental stage and enabled the mouse.
	osweb.runner._canvas.style.cursor = 'default';
        osweb.runner._stage.update(); 
			
	// Finalize the parent (runner).	
    	osweb.runner._finalize();
    };

    // Bind the experiment class to the osweb namespace.
    osweb.experiment = osweb.promoteClass(experiment, "item");
}());

/*
 * Definition of the class inline_script.
 */

(function() 
{
    function inline_script(pExperiment, pName, pScript)
    {
	// Inherited.
	this.item_constructor(pExperiment, pName, pScript);
	
	// Define and set the public properties. 
	this._prepare_run  = false;   
        this._prepare_tree = null;
	this._run_tree     = null;
    }; 
	
    // Extend the class from its base class.
    var p = osweb.extendClass(inline_script, osweb.item);

    // Define and set the public properties. 
    p.description = 'Executes Python code';

    /*
     * Definition of private methods - compiling script.
     */

    p._compile = function(pScript)
    {
        if (pScript != '')
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
     * Definition of public methods - building item.         
     */
		
    p.reset = function()
    {
	// Resets all item variables to their default value.
	this._var_info     = null;
	this.vars._prepare = '';
	this.vars._run     = '';
    };

    p.from_string = function(pString)
    {
    	// Parses a definition string.
	this.reset();
		
	// Split the string into an array of lines.  
	if (pString != null)
	{
            var read_run_lines     = false;
            var read_prepare_lines = false;
            var lines = pString.split('\n');
            for (var i=0; i < lines.length; i++)
            {
		var tokens = osweb.syntax.split(lines[i]);
			
		if ((tokens != null) && (tokens.length > 0))
		{
                    switch (tokens[0])
                    {
			case 'set': 
                            this.parse_variable(lines[i]);
                            
                        break;
			case '__end__':
                            read_run_lines     = false;
                            read_prepare_lines = false;
                            
			break;	
			case '___prepare__':
                            read_prepare_lines = true;
                            
			break;
			case '___run__':
                            read_run_lines = true;
                            
			break;
			default:
                            if (read_run_lines == true)
                            {
				this.vars._run = this.vars._run + lines[i] + '\n';
                            }
                            else if (read_prepare_lines == true)
                            {
                            	this.vars._prepare = this.vars._prepare + lines[i] + '\n';
                            }
                    }
		}
		else 
		{
                    if (read_run_lines == true)
                    {
			this.vars._run = this.vars._run + lines[i] + '\n';
                    }
                    else if (read_prepare_lines == true)
                    {
			this.vars._prepare = this.vars._prepare + lines[i] + '\n';
                    }
            	} 
            }
	}
    };

    /*
     * Definition of public methods - running item.         
     */

    p.prepare = function()
    {
        // Compile the script code to ast trees.
        this._prepare_tree = osweb.parser._prepare(this.vars._prepare);
        this._run_tree     = osweb.parser._prepare(this.vars._run);
	
        // Execute the run code.
 	if (this._prepare_tree != null)
    	{
            // Set the current item.
            osweb.events._current_item = this;
            
            // Set the prepare run toggle.
            this._prepare_run = true;
            
            // Start the parser
            osweb.parser._run(this, this._prepare_tree);    		
        }
        else
        {
            // Inherited.	
            this.item_prepare();
        }    
    };

    p.run = function()
    {
    	// Inherited.	
	this.item_run();
        
        // Record the onset of the current item.
	this.set_item_onset(); 

        // Execute the run code.
 	if (this._run_tree != null)
    	{
            // Set the prepare run toggle.
            this._prepare_run = false;
            
            // Start the parser
            osweb.parser._run(this, this._run_tree);    		
    	}
    };

    p.complete = function()
    {
        // Check if the parser is ready. 
        if (osweb.parser._status == 1)
        {
            // Process the current active node.
            osweb.parser._process_node();
        }
        else
        {    
            if (this._prepare_run === true)             
            {
                // Inherited prepare.	
                this.item_prepare();
            }    
            else
            { 
                // Inherited.           
                this.item_complete();
            }
        }    
    }; 
	
    p.complete_script = function()
    {
        // Added for video script functionaliry.
        this.complete();
    };

    // Bind the Sequence class to the osweb namespace.
    osweb.inline_script = osweb.promoteClass(inline_script, "item");
}());

/*
 * Definition of the class keyboard_response.
 */

(function() 
{
    function keyboard_response(pExperiment, pName, pScript)
    {
	// Inherited create.
	this.generic_response_constructor(pExperiment, pName, pScript);

        // Definition of private properties. 
	this._flush    = 'yes';
	this._keyboard = new osweb.keyboard(this.experiment); 
    }; 
	
    // Extend the class from its base class.
    var p = osweb.extendClass(keyboard_response, osweb.generic_response);

        // Definition of public properties. 
    p.description = 'Collects keyboard responses';
	
    /*
     * Definition of public methods - build cycle.
     */

    p.reset = function()
    {
	// Resets all item variables to their default value.
	this.auto_response          = 'space';
	this.process_feedback       = true; 
	this.vars.allowed_responses = null;
	this.vars.correct_response  = null;
	this.vars.duration          = 'keypress';
	this.vars.flush             = 'yes';
	this.vars.timeout           = 'infinite';
    };

    /*
     * Definition of public methods - run cycle.
     */

    p.prepare = function()
    {	
	// Set the internal flush property.
	this._flush = (this.vars.flush) ? this.vars.flush : 'yes';

    	// Inherited.	
	this.generic_response_prepare();
    };

    p.run = function()
    {
	// Inherited.	
	this.generic_response_run();

        // Record the onset of the current item.
	this.set_item_onset(); 
	
	// Flush responses, to make sure that earlier responses are not carried over.
        if (this._flush == 'yes')
	{	
            this._keyboard.flush();
	}		
	
        this.set_sri();
	this.process_response();
    };
	
    // Bind the keyboard_response class to the osweb namespace.
    osweb.keyboard_response = osweb.promoteClass(keyboard_response, "generic_response");
}());

/*
 * Definition of the class logger.
 */

(function() 
{
    function logger(pExperiment, pName, pScript)
    {
	// Inherited create.
	this.item_constructor(pExperiment, pName, pScript);
	
        // Definition of private properties. 
	this._logvars = null;
    }; 
	
    // Extend the class from its base class.
    var p = osweb.extendClass(logger, osweb.item);

    // Definition of public properties. 
    p.description = 'Logs experimental data';
    p.logvars	  = [];
	
    /*
     * Definition of public class methods - build cycle.
     */

    p.reset = function()
    {
        // Resets all item variables to their default value.
	this._logvars      = null;
	this.logvars       = [];
	this.vars.auto_log = 'yes';
    };

    p.from_string = function(pString)
    {
	// Parses a definition string.
	this.variables = {};
	this.comments  = [];
	this.reset();

	// Split the string into an array of lines.  
	if (pString != null)
	{
            var lines = pString.split('\n');
            for (var i=0; i < lines.length; i++)
            {
		if ((lines[i] != '') && (this.parse_variable(lines[i]) == false))
		{
                    var tokens = osweb.syntax.split(lines[i]);
                    if ((tokens[0] == 'log') && (tokens.length > 0))
                    {
			this.logvars.push(tokens[1]);
                    }	
		}
            }
        }
    };	

    /*
     * Definition of public class methods - run cycle.
     */

    p.run = function()
    {
	// Inherited.	
	this.item_run();
		
	// Run item only one time.   
	if (this._status != osweb.constants.STATUS_FINALIZE)
	{
            // item is finalized.
            this._status = osweb.constants.STATUS_FINALIZE;

            this.set_item_onset();
            if (this._logvars == null)
            {
		if (this.vars.auto_log == 'yes')
		{
                    this._logvars = this.experiment._log.all_vars();
		}
		else
		{
                    this._logvars = [];
                    for (variable in this.logvars)
                    {
 			if ((variable in this._logvars) == false)
 			{
                            this._logvars.push(variable);
			}
                    }
                    this._logvars.sort();		
		}
            }
            this.experiment._log.write_vars(this._logvars); 

            // Complete the cycle.
            this.complete();
        };
    };

    p.complete = function()
    {
        // Inherited.	
        this.item_complete();
    };

    // Bind the logger class to the osweb namespace.
    osweb.logger = osweb.promoteClass(logger, "item");
}());

/*
 * Definition of the class loop.
 */

(function() 
{
    function loop(pExperiment, pName, pScript)
    {
	// Inherited create.
	this.item_constructor(pExperiment, pName, pScript);

        // Definition of private properties. 
        this._break_if = '';
        this._cycles   = [];
        this._index    = -1;
        this._keyboard = null;
    }; 
	
    // Extend the class from its base class.
    var p = osweb.extendClass(loop, osweb.item);

    // Definition of public properties. 
    p.description = 'Repeatedly runs another item';
    p.matrix      = null;

    /*
     * Definition of public methods - building cycle.         
     */

    p.reset = function()
    {
	// Resets all item variables to their default value.
	this.matrix        = {};
	this.vars.cycles   = 1;
	this.vars.repeat   = 1;
	this.vars.skip     = 0;
	this.vars.offset   = 'no';
	this.vars.order    = 'random';
	this.vars.item     = '';
	this.vars.break_if = 'never';
    };

    p.from_string = function(pString)
    {
    	// Creates a loop from a definition in a string.
    	this.comments  = [];
	this.variables = {};
	this.reset();
		
	// Split the string into an array of lines.  
	if (pString != null)
	{
            var lines = pString.split('\n');
            for (var i=0; i < lines.length; i++)
            {
		if ((lines[i] != '') && (this.parse_variable(lines[i]) == false))
		{
                    var tokens = osweb.syntax.split(lines[i]);
                    if ((tokens[0] == 'run') && (tokens.length > 1))
                    {
                    	this.vars.item = tokens[1];
                    }	
                    else if ((tokens[0] == 'setcycle') && (tokens.length > 3))
                    {
			var cycle = tokens[1];
			var name  = tokens[2];
			var value = osweb.syntax.remove_quotes(tokens[3]);
					
			// Check if the value is numeric
                        value = osweb.syntax.isNumber(value) ? Number(value) : value;

                        // Convert the python expression to javascript.
			if (value[0] == '=')
			{
                            // Parse the python statement. 
                            value = osweb.parser._prepare(value.slice(1));
                            
                            if (value !== null)        
                            {
                                value = value.body[0];
                            }    
			}

                        if (this.matrix[cycle] == undefined)
			{
                            this.matrix[cycle] = {};
			}
			
                        this.matrix[cycle][name] = value;
                    }	
		}
            }	
	}
    };
  
    /*
     * Definition of public methods - runn cycle.         
     */

    p.shuffle = function(list)
    {
        var i, j, t;
	for (i = 1; i < list.length; i++) 
	{
	    j = Math.floor(Math.random() * (1 + i));  
	    if (j != i) 
	    {
	        t       = list[i];                        
                list[i] = list[j];
	        list[j] = t;
            }
	}			
    };

    p.apply_cycle = function(cycle)
    {
	// Sets all the loop variables according to the cycle.
	if (cycle in this.matrix)
	{
            for (var variable in this.matrix[cycle])
            {
		// Get the value of the variable.
		var value = this.matrix[cycle][variable];

		// Check for python expression.
		if (typeof value === 'object')
                {
                    // value contains ast tree, run the parser.
                    try
                    {	
                        // Evaluate the expression
                        value = osweb.parser._runstatement(value);
                    }
                    catch (e)
                    {
                        // Error during evaluation.
                        osweb.debug.addError('Failed to evaluate ' + value + ' in loop item ' + this.name);
                    }						
                }
				
                // Set the variable.
                this.experiment.vars.set(variable, value);
            }
	}
    };
	
    p.prepare = function()
    {
	// Prepare the break if condition.
	if ((this.vars.break_if != '') && (this.vars.break_if != 'never'))
	{
            this._break_if = this.syntax.compile_cond(this.vars.break_if);
        }
	else
	{
            this._break_if = null;
	}

	//  First generate a list of cycle numbers
	this._cycles = [];
	this._index  = 0;
		
	// Walk through all complete repeats
	var whole_repeats = Math.floor(this.vars.repeat);
	for (var j = 0; j < whole_repeats; j++)
	{
            for (var i = 0; i < this.vars.cycles; i++)
            {
		this._cycles.push(i);
            }
	}
				
	// Add the leftover repeats.
	var partial_repeats = this.vars.repeat - whole_repeats;
	if (partial_repeats > 0)
	{
            var all_cycles = Array.apply(null, {length: this.vars.cycles}).map(Number.call, Number);    
            var remainder  = Math.floor(this.vars.cycles * partial_repeats);
            for (var i = 0; i < remainder; i++)
            {
                // Calculate random position.
                var position = Math.floor(Math.random() * all_cycles.length);     
                // Add position to cycles.
                this._cycles.push(position);
                // Remove position from array.
                all_cycles.splice(position,1);
            }
	}		

	// Randomize the list if necessary.
	if (this.vars.order == 'random')
	{
            this.shuffle(this._cycles);
	}	
	else
	{
            // In sequential order, the offset and the skip are relevant.
            if (this._cycles.length < this.vars.skip)  
            {
		osweb.debug.addError('The value of skip is too high in loop item ' + this.name + '. You cannot skip more cycles than there are.');
            }
            else
            {
		if (this.vars.offset == 'yes')
		{
                    // Get the skip elements.
                    var skip = this._cycles.slice(0, this.vars.skip);
					
                    // Remove the skip elements from the original location.
                    this._cycles = this._cycles.slice(this.vars.skip);

                    // Add the skip element to the end.
                    this._cycles = this._cycles.concat(skip);										
		}
		else
		{
                    this._cycles = this._cycles.slice(this.vars.skip);
		}
            }
	}
		
	// Create a keyboard to flush responses between cycles.
	this._keyboard = new osweb.keyboard(this.experiment);
	
        // Make sure the item to run exists.
	if (this.experiment.items._items[this.vars.item] === 'undefined')
        {
            osweb.debug.addError('Could not find item ' + this.vars.item + ', which is called by loop item ' + this.name);
        }    

        // Inherited.	
	this.item_prepare();
	
	// Set the onset time.
	this.set_item_onset();
    };

    p.run = function()
    {
        // Inherited.	
        this.item_run();

        if (this._cycles.length > 0)
        {
            var exit = false;
            this._index = this._cycles.shift();
            this.apply_cycle(this._index);
		
            if (this._break_if != null)
            {
                this.python_workspace['this'] = this;
                
                var break_if = osweb.syntax.eval_text(this._break_if); 
                
                if (this.python_workspace._eval(break_if) == true)
                {
                    exit = true;
                }	
            }
			
            if (exit == false)
            {
		this.experiment.vars.repeat_cycle = 0;
		
                osweb.item_store.prepare(this.vars.item, this);
                //osweb.item_store.execute(this.vars.item, this);
            }
            else
            {
                // Break the loop.
                this.complete();
            }
        }
        else
        {
            // Break the loop.
            this.complete();
        }
    };	

    p.complete = function()
    {
        // Check if if the cycle must be repeated.
	if (this.experiment.vars.repeat_cycle == 1)
	{
            osweb.debug.msg('repeating cycle ' + this._index);
			
            this._cycles.push(this._index);
            
            if (this.vars.order == 'random')
            {
		this.shuffle(this._cycles);
            }
    	}
        else
        {
            // All items are processed, set the status to finalized.
            this._status = osweb.constants.STATUS_FINALIZE;

            // Inherited.	
            this.item_complete();
        }    
    };

    // Bind the loop class to the osweb namespace.
    osweb.loop = osweb.promoteClass(loop, "item");
}());

/*
 * Definition of the class mouse_response.
 */

(function() 
{
    function mouse_response(pExperiment, pName, pScript)
    {
	// Inherited create.
	this.generic_response_constructor(pExperiment, pName, pScript);

        // Definition of private properties. 
	this._flush = 'yes';
	this._mouse = new osweb.mouse(this.experiment);
    }; 
	
    // Extend the class from its base class.
    var p = osweb.extendClass(mouse_response, osweb.generic_response);

    // Definition of public properties. 
    p.description = 'Collects mouse responses';
    p.resp_codes  = {};
	
    /*
     * Definition of public methods - build cycle.
     */
	
    p.reset = function()
    {
	// Resets all item variables to their default value.
	this.auto_response          = 1;
	this.process_feedback       = true;
	this.resp_codes             = {};
	this.resp_codes['0']        = 'timeout';
	this.resp_codes['1']        = 'left_button';
	this.resp_codes['2']        = 'middle_button';
	this.resp_codes['3']        = 'right_button';
	this.resp_codes['4']        = 'scroll_up';
	this.resp_codes['5']        = 'scroll_down';
	this.vars.allowed_responses = null;
	this.vars.correct_response  = null;
	this.vars.duration          = 'mouseclick';
	this.vars.flush             = 'yes';
	this.vars.show_cursor       = 'yes';
	this.vars.timeout           = 'infinite';
    };

    /*
     * Definition of public methods - run cycle.
     */

    p.prepare = function()
    {	
	// Set the internal flush property.
	this._flush = (this.vars.flush) ? this.vars.flush : 'yes';
 
        // Inherited.	
	this.generic_response_prepare();
   };

    p.run = function()
    {
	// Inherited.	
	this.generic_response_run();

        // Record the onset of the current item.
	this.set_item_onset(); 
        
	// Show the cursor if defined.
        if (this.vars.show_cursor == 'yes')
	{	
            this._mouse.show_cursor(true);
        }

	// Flush responses, to make sure that earlier responses are not carried over.
	if (this._flush == 'yes')
	{	
            this._mouse.flush();
	}		
    
        this.set_sri();
        this.process_response();
    };

    p.complete = function()
    {
        // Hide the mouse cursor.    
        this._mouse.show_cursor(false);
       
        // Inherited.	
        this.generic_response_complete();
    };

    // Bind the mouse_response class to the osweb namespace.
    osweb.mouse_response = osweb.promoteClass(mouse_response, "generic_response");
}());

/*
 * Definition of the class sampler.
 */

(function() 
{
    function sampler(pExperiment, pName, pScript)
    {
	// Inherited.
	this.generic_response_constructor(pExperiment, pName, pScript);

    	// Definition of private properties.
        this._sample  = null;
        this._sampler = null;
    }; 
	
    // Extend the class from its base class.
    var p = osweb.extendClass(sampler, osweb.generic_response);

    // Definition of public properties.
    p.block	  = false;
    p.description = 'Plays a sound file in .wav or .ogg format';
    
    /*
     * Definition of public methods - build cycle. 
     */

    p.reset = function()
    {
	// Resets all item variables to their default value.
	this.block           = false;
	this.vars.sample     = '';
	this.vars.pan        = 0;
	this.vars.pitch      = 1;
	this.vars.fade_in    = 0;
	this.vars.stop_after = 0;
	this.vars.volume     = 1;
	this.vars.duration   = 'sound';
    };

    /*
     * Definition of public methods - run cycle. 
     */

    p.prepare = function()
    {
        // Create the sample
	if (this.vars.sample != '')
	{
            // Retrieve the content from the file pool.
            this._sample         = osweb.pool[this.syntax.eval_text(this.vars.sample)];  
            this._sampler        = new osweb.sampler_backend(this.experiment, this._sample);
            this._sampler.volume = this.vars.volume;
	}
	else
	{
            /* raise osexception(
            u'No sample has been specified in sampler "%s"' % self.name) */
	}
    
        // Inherited.	
	this.generic_response_prepare();
    };

    p.run = function()
    {
    	this.set_item_onset();
	this.set_sri();
	this._sampler.play();
	this.process_response();
    };	

    // Bind the sampler class to the osweb namespace.
    osweb.sampler = osweb.promoteClass(sampler, "generic_response");
}());

/*
 * Definition of the class sequence.
 */

(function() 
{
    function sequence(pExperiment, pName, pScript)
    {
	// Inherited create.
	this.item_constructor(pExperiment, pName, pScript);
	
        // Definition of private properties. 
	this._index         = -1;
	this._index_prepare = -1;
        this._items         = null;
        this._keyboard      = null;    
    }; 
	
    // Extend the class from its base class.
    var p = osweb.extendClass(sequence, osweb.item);

    // Definition of public properties. 
    p.description    = 'Runs a number of items in sequence';
    p.flush_keyboard = 'yes';
    p.items          = null;
	
    /*
     * Definition of public methods - build cycle.         
     */

    p.reset = function()
    {
	// Resets all item variables to their default value..
	this.items               = [];
	this.vars.flush_keyboard = 'yes';
    };

    p.from_string = function(pString)
    {
	// Parses a definition string.
	this.variables = {};
	this.comments  = [];
	this.reset();
		
	// Split the string into an array of lines.  
	if (pString != null)
	{
            var lines = pString.split('\n');
            for (var i=0; i < lines.length; i++)
            {
		if ((lines[i] != '') && (this.parse_variable(lines[i]) == false))
		{
                    var tokens = osweb.syntax.split(lines[i]);
                    if ((tokens.length > 0) && (tokens[0] == 'run'))
                    {
                        var item = tokens[1];
			var cond = 'always';
			if (tokens.length > 2)
			{
                            cond = tokens[2];
			}	

			// Push the item and condition definition to the items list.
			this.items.push({'item': item, 'cond': cond});
                    }	
            	} 
            }
	}					
    };

    /*
     * Definition of public methods - run cycle.         
     */

    p.prepare = function()
    {
	// Inherited.	
	this.item_prepare();
	
        // Create a keyboard to flush responses at the start of the run phase
	if (this.vars.flush_keyboard == 'yes')
        {	
            this._keyboard = new osweb.keyboard(this.experiment);
        }
        else
        {    
            this._keyboard = null;
        }    
	
        // Generate the items list for the run cycle.
        this._index = 0;
	this._items = [];
        
        // Prepare the items.
        this.prepare_complete();
        
                /* this._items = [];
	for (var i=0; i < this.items.length; i++)
	{
            if ((this.items[i].item in osweb.item_store._items) === false)
            {
		osweb.debug.addError('Could not find item ' + this.items[i].item.name + ' which is called by sequence item ' + this.name);
            }
            else 
            {
                // Prepare the items.
                osweb.item_store.prepare(this.items[i].item);
		
                // Add the item to the internal list.
                this._items.push({'item': this.items[i].item, 'cond': osweb.syntax.compile_cond(this.items[i].cond)});
            }
	} */	
    };
    
    p.prepare_complete = function()
    {
        // Generate the items list for the run cycle.
        if (this._index < this.items.length)
        {
            if ((this.items[this._index].item in osweb.item_store._items) === false)
            {
		osweb.debug.addError('Could not find item ' + this.items[this._index].item.name + ' which is called by sequence item ' + this.name);
            }
            else 
            {
                // Increase the current index.
                this._index++;
                
                // Add the item to the internal list.
                this._items.push({'item': this.items[this._index - 1].item, 'cond': osweb.syntax.compile_cond(this.items[this._index - 1].cond)});
                
                // Prepare the item.
                osweb.item_store.prepare(this.items[this._index - 1].item, this);
	    }
        }
        else
        {
            // Prepare process is done, start execution.
            this._index = 0;
            
            // Remove the prepare phase form the stack.    
            osweb.item_stack.pop();
    
  	    // Execute the next cycle of the sequnce itself.
            osweb.item_store.run(this.name, this._parent);
        }    
    };
    
    p.run = function()
    {
        // Inherited.	
        this.item_run();

        // Check if all items have been processed.
        if (this._index < this._items.length)
        {
            // Flush the keyboard at the beginning of the sequence.
            if ((this._index == 0) && (this.vars.flush_keyboard == 'yes'))
            {
                this._keyboard.flush();
            }

            // Increase the current index.
            this._index++;

            // Set the workspace.
            osweb.python_workspace['self'] = this;

            // Check if the item may run.                            
            if (osweb.python_workspace._eval(this._items[this._index - 1].cond) == true) 
            {   
                // run the current item of the sequence object.
		osweb.item_store.run(this._items[this._index - 1].item, this);
            }
  	    else
  	    {
  	    	// Execute the next cycle of the sequnce itself.
  	    	this.run();	
  	    }
	}
	else
	{
            // sequence is finalized.
            this.complete();
        }
    };
	
    p.complete = function()
    {
        // sequence is finalized.
        this._status = osweb.constants.STATUS_FINALIZE;
 
        // Inherited.	
        this.item_complete();
    };

    // Bind the sequence class to the osweb namespace.
    osweb.sequence = osweb.promoteClass(sequence, "item");
}());
/*
 * Definition of the class sketchpad.
 */

(function() 
{
    function sketchpad(pExperiment, pName, pScript)
    {
	// Set publice properties.
    	this.canvas   = new osweb.canvas(pExperiment, false);
	this.elements = [];

	// Inherited create.
	this.generic_response_constructor(pExperiment, pName, pScript);
    }; 
	
    // Extend the class from its base class.
    var p = osweb.extendClass(sketchpad, osweb.generic_response);

    // Definition of public properties. 
    p.canvas   = null;
    p.elements = [];

    /*
     * Definition of private methods - build cycle.         
     */
    
    p._compare = function(a,b) 
    {
        // Sort function used for determining the draw index (z-index) of alle elemente.
        if (a.z_index() < b.z_index())
            return 1;
        else if (a.z_index() > b.z_index())
            return -1;
        else 
            return 0;
    };
    
    /*
     * Definition of public methods - build cycle..         
     */

    p.reset = function()
    {
    	// Resets all item variables to their default value.
    	this.elements      = [];
	this.vars.duration = 'keypress';
    };

    p.from_string = function(pString)
    {
        // Define and reset variables to their defaults.
        this.variables = {};
        this.comments  = [];
 	this.reset();
		
	// Split the string into an array of lines.  
	if (pString != null)
	{
            var lines = pString.split('\n');
            for (var i=0; i < lines.length; i++)
            {
		if ((lines[i] != '') && (this.parse_variable(lines[i]) == false))
		{
                    var tokens = osweb.syntax.split(lines[i]);
                    if ((tokens.length > 0) && (tokens[0] == 'draw'))
                    {
			if (osweb.isClass(tokens[1]) == true)
			{
                            var element = osweb.newElementClass(tokens[1], this, lines[i]);
                            this.elements.push(element);	
			}	
                        else
			{
                            // error.
			}
                    }
		}
            }

            // Sort the elements usin the z-index.
            this.elements.sort(this._compare);
        }					
    };
	
    /*
     * Definition of public methods - runn cycle.         
     */

    p.prepare = function()
    {
        // Draw the elements. 
	for (var i=0; i < this.elements.length; i++)
	{
            if (this.elements[i].is_shown() == true)
            {
		this.elements[i].draw();
            }			
	}				
    
        // Inherited.	
	this.generic_response_prepare();
    };

    p.run = function()
    {
	// Inherited.	
	this.generic_response_run();
		
        // Set the onset and start the stimulus response process.        
	this.set_item_onset(this.canvas.show()); 
	this.set_sri(false);
	this.process_response();
    };
	
    p.complete = function()
    {
	// Clear the canvas.
	this.canvas.clear();
		
	// Inherited.	
	this.generic_response_complete();
    };

    // Bind the sketchpad class to the osweb namespace.
    osweb.sketchpad = osweb.promoteClass(sketchpad, "generic_response");
}());

/*
 * Definition of the class feedback.
 */

(function() 
{
    function feedback(pExperiment, pName, pScript)
    {
	// Inherited create.
	this.sketchpad_constructor(pExperiment, pName, pScript);
    }; 
	
    // Extend the class from its base class.
    var p = osweb.extendClass(feedback, osweb.sketchpad);

    // Definition of public properties. 
    p.description = 'Provides feedback to the participant';

    /*
     * Definition of public methods - build cycle.
     */

    p.reset = function()
    {
    	// Resets all item variables to their default value.
	this.sketchpad_reset();
	this.vars.reset_variables = 'yes';
    };	
    
    /*
     * Definition of public methods - run cycle.
     */

    p.prepare = function()
    {
        // Prepares the item.
        this._parent.prepare_complete();
    };

    p.run = function()
    {
    	// Inherited.	
	this.sketchpad_prepare();
	this.sketchpad_run();
    };

    p.complete = function()
    {
    	// Inherited.	
	this.sketchpad_complete();

	// Reset feedback variables.
	if (this.vars.reset_variables == 'yes')
	{
            this.experiment.reset_feedback();
	}
    };

    // Bind the feedback class to the osweb namespace.
    osweb.feedback = osweb.promoteClass(feedback, "sketchpad");
}());

/*
 * Definition of the class synth.
 */

(function() 
{
    function synth(pExperiment, pName, pScript)
    {
	// Inherited.
	this.sampler_constructor(pExperiment, pName, pScript);
    }; 
	
    // Extend the class from its base class.
    var p = osweb.extendClass(synth, osweb.sampler);

    // Define and set the public properties. 
    p.description = 'A basic sound synthesizer';

    /*
     * Definition of public class methods.
     */

    // Bind the synth class to the osweb namespace.
    osweb.synth = osweb.promoteClass(synth, "sampler");
}());
