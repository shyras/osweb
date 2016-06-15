
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
	// Inherited.	
	this.item_prepare();

	// Implements the prepare phase of the item.
	this.prepare_timeout();
	this.prepare_allowed_responses();
	this.prepare_duration();
    };
    
    p.update = function(pResponse)
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
