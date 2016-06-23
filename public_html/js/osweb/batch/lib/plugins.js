
/*
 * Definition of the class advanced_delay.
 */

(function() 
{
    function advanced_delay(pExperiment, pName, pScript)
    {
	// Inherited.
	this.item_constructor(pExperiment, pName, pScript);
    
        // Set private properties.
        this._duration = -1;
    }; 
	
    // Extend the class from its base class.
    var p = osweb.extendClass(advanced_delay, osweb.item);

    // Define and set the public properties. 
    p.description = 'Waits for a specified duration';

    /*
     * Definition of public class methods - build cycle.
     */

    p.reset = function()
    {
    	// Resets all item variables to their default value.
	this.vars.duration    = 1000;
	this.vars.jitter      = 0;
	this.vars.jitter_mode = 'Uniform';
    }; 
    
    /*
     * Definition of public class methods - run cycle.
     */

    p.prepare = function()
    {
	this._duration = this.vars.duration;
        /* # Sanity check on the duration value, which should be a positive numeric
	# value.
	if type(self.var.duration) not in (int, float) or self.var.duration < 0:
		raise osexception(
			u'Duration should be a positive numeric value in advanced_delay %s' \
			% self.name)
	if self.var.jitter_mode == u'Uniform':
		self._duration = random.uniform(self.var.duration-self.var.jitter/2,
			self.var.duration+self.var.jitter/2)
	elif self.var.jitter_mode == u'Std. Dev.':
		self._duration = random.gauss(self.var.duration, self.var.jitter)
	else:
		raise osexception(
			u'Unknown jitter mode in advanced_delay %s' % self.name)
	# Don't allow negative durations.
	if self._duration < 0:
		self._duration = 0
	self._duration = int(self._duration)
	self.experiment.var.set(u'delay_%s' % self.name, self._duration)
	debug.msg(u"delay for %s ms" % self._duration) */

        // Inherited.	
	this.item_prepare();
    };
    
    p.run = function() 
    {
        // Inherited.	
    	this.item_run();

        // Set the onset time.
        this.set_item_onset(this.time());
        this.sleep(this._duration);		
    };

    // Bind the advanced_delay class to the osweb namespace.
    osweb.advanced_delay = osweb.promoteClass(advanced_delay, "item");
}());

/*
 * Definition of the class form_base.
 */

(function() 
{
    function form_base(pName, pExperiment, pScript, pItem_type, pDescription)
    {
	// Inherited.
	this.item_constructor(pExperiment, pName, pScript);

        // Set the class private properties.
        this._form_text = false;
    
        // Set the class public properties.
        this.description = pDescription;
        this.item_type   = pItem_type;
    }   
	
    // Extend the class from its base class.
    var p = osweb.extendClass(form_base, osweb.item);

    // Define and set the public properties. 
    p.cols        = [];
    p.description = 'A generic form plug-in';
    p.form        = null;
    p.rows        = [];
    
    /*
     * Definition of public class methods - build cycle.
     */

    p.reset = function() 
    {
  	// Resets all item variables to their default value.
  	this.vars.cols        = '2;2';
	this.vars.rows        = '2;2';
	this.vars.spacing     = 10;
	this.vars._theme      = 'gray';
	this.vars.only_render = 'no';
	this.vars.timeout     = 'infinite';
	this.vars.margins     = '50;50;50;50';
	this._variables       = [];   
	this._widgets         = [];
    };    

    p.parse_line = function(pString)
    {
        // Split the line in tokens.
        var list = this.syntax.split(pString);

        if ((this._form_text == true) && (list[0] != '__end__'))
        {
            this.vars['form_text'] = this.vars['form_text'] + pString.replace('\t','');
        };

        // Check for widget definition.
        if (list[0] == 'widget')
        {
            // Remove widget command.
            list.shift();

            // Add widget to the list.
            this._widgets.push(list);
        }
        else if (list[0] == '__form_text__')
        {
            this.vars['form_text'] = '';
            this._form_text        = true;
        }
        else if (list[0] == '__end__')
        {
            this._form_text = false;
        }
        
        /* if u'var' in kwdict:
	 self._variables.append(kwdict[u'var'])   */  
    };

    /*
     * Definition of public class methods - run cycle.
     */

    p.prepare = function()
    {
        // Inherited.	
    	this.item_prepare();

        // Retrieve the column, rows and margins.
        var cols    = this.vars.cols.split(';');
        var rows    = this.vars.rows.split(';');
        var margins = this.vars.margins.split(';'); 
        
        // Get the time out paramter.
        if (this.vars.timeout == 'infinite')
        {                
            var timeout = null;
        }    
        else
        {    
            var timeout = this.vars.timeout;
        }    
        
        // Create the basic form.    
        this.form = new osweb.form(this.experiment, cols, rows, this.vars.spacing, margins, this.vars._theme, this, timeout, this.vars.form_clicks == 'yes');

        for (var i=0;i < this._widgets.length; i++)
        {
            this.focus_widget = null;
            var kwdict = {};
            var parameters = [];
            parameters.push(this.form);
            if (this._widgets[i].length > 5) 
            {
                for (var j=5;j < this._widgets[i].length;j++)
                {
                    var varName  = String(this._widgets[i][j]).substr(0,String(this._widgets[i][j]).indexOf('='));
                    var varValue = String(this._widgets[i][j]).substring(String(this._widgets[i][j]).indexOf('=') + 1,String(this._widgets[i][j]).length);
                    kwdict[varName] = osweb.syntax.remove_quotes(varValue);
                    kwdict[varName] = osweb.syntax.eval_text(kwdict[varName], this.vars);
                
                    parameters.push(osweb.syntax.remove_quotes(varValue));
                } 
            }

            /* # Process focus keyword
            focus = False
            if u'focus' in kwdict:
                if kwdict[u'focus'] == u'yes':
                    focus = True
                del kwdict[u'focus'] */
            
            // Parse arguments
            var _type   = this._widgets[i][4];
            var col     = this._widgets[i][0];
            var row     = this._widgets[i][1];
            var colspan = this._widgets[i][2];
            var rowspan = this._widgets[i][3];
	
            // Create the widget.
            try 
            {
                var _w = osweb.newWidgetClass(_type, this.form, kwdict);
                //console.log(parameters);
                //var _w = osweb.newWidgetClass(_type, parameters);
            }
            catch(e)
            {
                osweb.debug.addError('Failed to create widget ' + _type + ', error:' + e);
            }    
                
            // Set the width position and form.                    
            this.form.set_widget(_w, [col, row], colspan, rowspan);
            
            // Add as focus widget
            if (focus == true) 
            {
            	if (this.focus_widget != null)
                {
                    osweb.debug.addError('Osweb error: You can only specify one focus widget');
                } 
                else
                {
                    this.focus_widget = _w;
                }
            }    
        }
    };

    p.run = function() 
    {
        // Inherited.	
    	this.item_run();

        // Set dimensions.
        this.form._parentform.style.width      = osweb.runner._canvas.width;
        this.form._parentform.style.height     = osweb.runner._canvas.height;
        this.form._parentform.style.background = this.experiment.vars.background;
                
        // Hide the canvas, show the form.
        osweb.runner._canvas.style.display  = 'none';
        this.form._parentform.style.display = 'block';
        this.form._form.style.display       = 'block';
    };

    p.complete = function()
    {
        // Hide the form
        this.form._parentform.style.display = 'none';
        this.form._form.style.display       = 'none';
        osweb.runner._canvas.style.display  = 'inline';

        // form is finalized.
        this._status = osweb.constants.STATUS_FINALIZE;

        // Inherited.	
        this.item_complete();
    };

    // Bind the form_base class to the osweb namespace.
    osweb.form_base = osweb.promoteClass(form_base, "item");
}());

/*
 * Definition of the class form_consent.
 */

(function() 
{
    function form_consent(pExperiment, pName, pScript)
    {
        // Inherited.
	this.form_base_constructor(pName, pExperiment, pScript, 'form_consent', 'A simple consent form');
    }; 
	
    // Extend the class from its base class.
    var p = osweb.extendClass(form_consent, osweb.form_base);

    // Define and set the public properties. 
    p.description = 'A simple consent form';

    /*
     * Definition of public class methods - run cycle.
     */

    p.run = function() 
    {
        // Inherited.	
    	this.form_base_run();
    };

    p.complete = function()
    {
        // Inherited.	
    	this.form_base_complete();
    };

    // Bind the form_consent class to the osweb namespace.
    osweb.form_consent = osweb.promoteClass(form_consent, "form_base");
}());

/*
 * Definition of the class form_multiple_choice.
 */

(function() 
{
    function form_multiple_choice(pExperiment, pName, pScript)
    {
	// Inherited.
	this.item_constructor(pExperiment, pName, pScript);
    }; 
	
    // Extend the class from its base class.
    var p = osweb.extendClass(form_multiple_choice, osweb.item);
    
    // Define and set the public properties. 
    p.description = 'A simple multiple choice item';

    // Bind the form_base class to the osweb namespace.
    osweb.form_multiple_choice = osweb.promoteClass(form_multiple_choice, "item");
}());

/*
 * Definition of the class form_text_display.
 */

(function() 
{
    function form_text_display(pExperiment, pName, pScript)
    {
        // Inherited.
	this.form_base_constructor(pName, pExperiment, pScript, 'form_text_display', 'A simple text display form');
    }; 
	
    // Extend the class from its base class.
    var p = osweb.extendClass(form_text_display, osweb.form_base);

    // Define and set the public properties. 
    p.description = 'A simple text display form';

    /*
     * Definition of public class methods - run cycle.
     */

    p.run = function() 
    {
        // Inherited.	
    	this.form_base_run();
     };

    p.complete = function()
    {
        // Inherited.	
    	this.form_base_complete();
    };

    // Bind the form_text_display class to the osweb namespace.
    osweb.form_text_display = osweb.promoteClass(form_text_display, "form_base");
}());

/*
 * Definition of the class form_text_input.
 */

(function() 
{
    function form_text_input(pExperiment, pName, pScript)
    {
	// Inherited.
	this.form_base_constructor(pExperiment, pName, pScript);
    }; 
	
    // Extend the class from its base class.
    var p = osweb.extendClass(form_text_input, osweb.form_base);

    // Define and set the public properties. 
    p.description = 'A simple text input form';

    // Bind the form_base class to the osweb namespace.
    osweb.form_text_input = osweb.promoteClass(form_text_input, "form_base");
}());

/*
 * Definition of the class form_text_render.
 */

(function() 
{
    function form_text_render(pExperiment, pName, pScript)
    {
	// Inherited.
	this.form_base_constructor(pExperiment, pName, pScript);
    }; 
	
    // Extend the class from its base class.
    var p = osweb.extendClass(form_text_render, osweb.form_base);

    // Define and set the public properties. 
    p.description = 'A simple text display form';

    // Bind the form_base class to the osweb namespace.
    osweb.form_text_render = osweb.promoteClass(form_text_render, "form_base");
}());

/*
 * Definition of the class media_player_vlc.
 */

(function() 
{
    function media_player_vlc(pExperiment, pName, pScript)
    {
	// Inherited.
	this.generic_response_constructor(pExperiment, pName, pScript);
    }; 
	
    // Extend the class from its base class.
    var p = osweb.extendClass(media_player_vlc, osweb.generic_response);

    // Define and set the public properties. 
    p.description = 'A video player';

    /*
     * Definition of public class methods - run cycle.
     */

    p.prepare = function()
    {
        // Opens the video file for playback.
        this._video        = osweb.pool[this.vars.get('video_src')];  
        this._video_player = new osweb.video_backend(this.experiment, this._video);
        
        // Set the script code option.
        if (this.vars.event_handler !== '')
        {
            this._video_player._script = osweb.parser._prepare(this.vars.event_handler);
        }
        
        // Set the full screen option (if enabled).
        this._video_player.full_screen = (this.vars.get('resizeVideo') == 'yes');
	
      	// Inherited.	
	this.generic_response_prepare();
    };    
    
    p.run = function() 
    {
        // Set the onset time.
        this.set_item_onset();
	this.set_sri();

        // Start the video player.
        this._video_player.play();    

        // Start response processing.
        this.process_response();
    };

    p.complete = function() 
    {
        console.log('video complete.');    
        
        // Stop the video playing.
	this._video_player.stop();
		
	// Inherited.	
	this.generic_response_complete();
    };    
    
    // Bind the media_player_vlc class to the osweb namespace.
    osweb.media_player_vlc = osweb.promoteClass(media_player_vlc, "generic_response");
}());

/*
 * Definition of the class notepad.
 */

(function() 
{
    function notepad(pExperiment, pName, pScript)
    {
	// Inherited.
	this.item_constructor(pExperiment, pName, pScript);
    }; 
	
    // Extend the class from its base class.
    var p = osweb.extendClass(notepad, osweb.item);

    // Define and set the public properties. 
    p.description = 'A simple notepad to document your experiment. This plug-in does nothing.';
    p.note        = '';

    /*
     * Definition of public class methods - run cycle.
     */

    p.run = function() 
    {
        // Inherited.	
    	this.item_run();

	// Show the information of the notepad on the console.
	//osweb.debug.addMessage(this.note);

        // Complete the current cycle.
        this.complete();
    };

    p.complete = function()
    {
        // sequence is finalized.
        this._status = osweb.constants.STATUS_FINALIZE;
 
        // Inherited.	
        this.item_complete();
    };

    // Bind the notepad class to the osweb namespace.
    osweb.notepad = osweb.promoteClass(notepad, "item");
}());

/*
 * Definition of the class repeat_cycle.
 */

(function() 
{
    function repeat_cycle(pExperiment, pName, pScript)
    {
    	// Inherited.
	this.item_constructor(pExperiment, pName, pScript);
    }; 
	
    // Extend the class from its base class.
    var p = osweb.extendClass(repeat_cycle, osweb.item);

   // Define and set the public properties. 
    p.description = 'Optionally repeat a cycle from a loop';
    
    /*
     * Definition of public class methods - run cycle.
     */

    p.prepare = function()
    {
        // Prepare the condtion for which the repeat_cycle must fire.
        this._condition = osweb.syntax.compile_cond(this.vars.get('condition'));

        // Inherited.	
	this.item_prepare();
    }; 

    p.run = function()
    {
    	// Inherited.	
	this.item_run();
		
	// Run item only one time.   
	if (this._status != osweb.constants.STATUS_FINALIZE)
        {
            if (osweb.python_workspace._eval(this._condition) == true) 
            {            
                this.experiment.vars.repeat_cycle = 1;
            }
            
            // Complete the current cycle.
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
    
    // Bind the repeat_cycle class to the osweb namespace.
    osweb.repeat_cycle = osweb.promoteClass(repeat_cycle, "item");
}());

/*
 * Definition of the class reset_feedback.
 */

(function() 
{
    function reset_feedback(pExperiment, pName, pScript)
    {
    	// Inherited.
	this.item_constructor(pExperiment, pName, pScript);
    }; 
	
    // Extend the class from its base class.
    var p = osweb.extendClass(reset_feedback, osweb.item);

    // Define and set the public properties. 
    p.description = 'Resets the feedback variables, such as "avg_rt" and "acc"';

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
            // Run the item.
            this.experiment.reset_feedback();

            // Complete the current cycle.
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
    
    // Bind the reset_feedback class to the osweb namespace.
    osweb.reset_feedback = osweb.promoteClass(reset_feedback, "item");
}());

/*
 * Definition of the class touch_response.
 */

(function() 
{
    function touch_response(pExperiment, pName, pScript)
    {
	// Inherited.
	this.mouse_response_constructor(pExperiment, pName, pScript);
    }; 
	
    // Extend the class from its base class.
    var p = osweb.extendClass(touch_response, osweb.mouse_response);

    // Define and set the public properties. 
    p.description = 'A grid-based response item, convenient for touch screens';

    /*
     * Definition of public methods - build cycle.
     */
	
    p.reset = function()
    {
        // Inherited.
        this.mouse_response_reset();
        this.vars.set('allowed_responses',null);
	
        // Resets all item variables to their default value.
        this.vars._ncol = 2;
	this.vars._nrow = 1;
    };

    /*
     * Definition of public methods - run cycle.
     */
    
    p.prepare = function()
    {
        // Temp hack
        this.experiment.vars.correct = -1;
   
        // Inherited.
        this.mouse_response_prepare();
    };
        
    p.process_response_mouseclick = function(pRetval)
    {
        // Processes a mouseclick response.
	this.experiment._start_response_interval = this.sri;
	this.experiment._end_response_interval   = pRetval.rtTime;
	this.experiment.vars.response		 = pRetval.resp;
	this.synonyms                            = this._mouse.synonyms(this.experiment.vars.response);
	this.experiment.vars.cursor_x            = pRetval.event.clientX;
	this.experiment.vars.cursor_y            = pRetval.event.clientY;
	
        var rect = osweb.runner._canvas.getBoundingClientRect();
        if (this.experiment.vars.uniform_coordinates == 'yes')
        {
            this._x = pRetval.event.clientX + (this.experiment.vars.width / 2);
	    this._y = pRetval.event.clientY + (this.experiment.vars.height / 2);
        }
        else
        {
            this._x = pRetval.event.clientX - rect.left;
	    this._y = pRetval.event.clientY - rect.top;
        }    
        
        // Calulate the row, column and cell. 
        this.col  = Math.floor(this._x / (this.experiment.vars.width  / this.vars._ncol));
	this.row  = Math.floor(this._y / (this.experiment.vars.height / this.vars._nrow));
	this.cell = this.row * this.vars._ncol + this.col + 1;
        this.experiment.vars.response = this.cell;
        this.synonyms                 = [String(this.experiment.vars.response)];
                
        // Do the bookkeeping 
        this.response_bookkeeping();
    };            

    // Bind the touch_response class to the osweb namespace.
    osweb.touch_response = osweb.promoteClass(touch_response, "mouse_response");
}());
