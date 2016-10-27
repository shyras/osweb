/*
* Definition of the class experiment.
*/
module.exports = function(osweb){
	"use strict";
	function experiment(pExperiment, pName, pScript, pPool_folder, pExperiment_path, 
		pFullscreen, pAuto_response, pLogfile, pSubject_nr, pWorkspace, pResources, 
		pHeartbeat_interval) {
		// Set the items property for this experiment.
		osweb.item_store._experiment = this;

		// Set the optional arguments
		pLogfile = (typeof pLogfile === 'undefined') ? null : pLogfile;

		// Set the private properties. 
		this._end_response_interval = null;
		this._start_response_interval = null;
		this._syntax = osweb.syntax;
		this._python_workspace = (pWorkspace) ? pWorkspace : osweb.python_workspace;

		// Set the public properties. 
		this.auto_response = (pAuto_response) ? pAuto_response : false;
		this.cleanup_functions = [];
		this.heartbeat_interval = (pHeartbeat_interval) ? pHeartbeat_interval : 1;
		this.items = osweb.item_store;
		this.output_channel = null;
		this.paused = false;
		this.plugin_folder = 'plugins';
		this.pool = osweb.file_pool_store;
		this.resources = (pResources) ? pResources : {};
		this.restart = false;
		this.running = false;
		this.vars = new osweb.var_store(this, null);

		// Set default variables
		this.vars.start = 'experiment';
		this.vars.title = 'My Experiment';
		this.vars.bidi = 'no';
		this.vars.round_decimals = 2;
		this.vars.form_clicks = 'no';
		this.vars.uniform_coordinates = 'no';

		// Sound parameters.
		this.vars.sound_freq = 48000;
		this.vars.sound_sample_size = -16;
		this.vars.sound_channels = 2;
		this.vars.sound_buf_size = 1024;

		// Default backend
		this.vars.canvas_backend = 'xpyriment';

		// Display parameters.
		this.vars.width = 1024;
		this.vars.height = 768;
		this.vars.background = 'black';
		this.vars.foreground = 'white';
		this.vars.fullscreen = (pFullscreen) ? 'yes' : 'no';

		// Font parameters.
		this.vars.font_size = 18;
		this.vars.font_family = 'mono';
		this.vars.font_italic = 'no';
		this.vars.font_bold = 'no';
		this.vars.font_underline = 'no';

		// Logfile parameters
		this.logfile = pLogfile;
		this.debug = osweb.debug.enabled;

		// Create the backend objects.
		this._canvas = new osweb.canvas(this);
		this._clock = new osweb.clock(this);
		this._log = new osweb.log(this, this.logfile);

		// Set the global anchors.
		window['clock'] = this._clock;
		window['log'] = this._log;

		// Inherited.
		this.item_constructor(pExperiment, pName, pScript);
	}

	// Extend the class from its base class.
	var p = osweb.extendClass(experiment, osweb.item);

	// Definition of public properties. 
	p.auto_response = false;
	p.cleanup_functions = [];
	p.heartbeat_interval = 1;
	p.items = null;
	p.output_channel = null;
	p.paused = false;
	p.plugin_folder = '';
	p.pool = null;
	p.resources = null;
	p.restart = false;
	p.running = false;

	/*
	 * Definition of public methods - general function.
	 */

	p.item_prefix = function() {
		// A prefix for the plug-in classes, so that [prefix][plugin] class is used instead of the [plugin] class.
		return '';
	};

	p.reset_feedback = function() {
		// Resets the feedback variables (acc, avg_rt, etc.)."""
		this.vars.total_responses = 0;
		this.vars.total_correct = 0;
		this.vars.total_response_time = 0;
		this.vars.avg_rt = 'undefined';
		this.vars.average_response_time = 'undefined';
		this.vars.accuracy = 'undefined';
		this.vars.acc = 'undefined';
	};

	p.set_subject = function(pNr) {
	        // Sets the subject number and parity (even/ odd). This function is called automatically when an experiment is started, so you do not generally need to call it yourself.
		this.vars.subject_nr = pNr;
		if ((pNr % 2) == 0) {
			this.vars.subject_parity = 'even';
		} else {
			this.vars.subject_parity = 'odd';
		}
	};

	/*
	 * Definition of public methods - building item.         
	 */

	p.read_definition = function(pString) {
		// Extracts a the definition of a single item from the string.
		var line = pString.shift();
		var def_str = '';
		while ((line != null) && (line.length > 0) && (line.charAt(0) == '\t')) {
			def_str = def_str + line.substring(1) + '\n';
			line = pString.shift();
		}
		return def_str;
	};

	/**
	 * Construct the experiment object from OpenSesame script and store the data
	 * in the object instance.
	 * @param  {string} pString The opensesame script contents
	 * @return {void}
	 */
	p.from_string = function(pString) {
		// Set debug message.
		osweb.debug.addMessage('building experiment');
            
		// Split the string into an array of lines.
		if (pString != null) {
			this._source = pString.split('\n');
			var l = this._source.shift();
			while (l != null) {
				// Set the processing of the next line.
				var get_next = true;
				try {
					var cmd, args, kwargs;
					// Split the single line into a set of tokens.
					[cmd, args, kwargs] = osweb.syntax.parse_cmd(l);
				} catch (e) {
					alertify.errorAlert("Failed to parse script. Maybe it " +
						"contains illegal characters or unclosed quotes? " + e.message);
				}

				if ((cmd != null) && (args.length > 0)) {
					// Try to parse the line as variable (or comment)
					if (this.parse_variable(l) == false) {
						if (cmd == 'define') {
							if (args.length == 2) {
								// Get the type, name and definition string of an item.
								var item_type = args[0];
								var item_name = osweb.syntax.sanitize(args[1]);
								var def_str = this.read_definition(this._source);
        							osweb.item_store.new(item_type, item_name, def_str);
							} else {
								// raise osexception(u'Failed to parse definition',line=line);
							}
						}
					}
				}

				// Get the next line.
				if (get_next == true) {
					l = this._source.shift();
				}
			}
		};
	};

	/*
	 * Definition of public methods - backends.
	 */

	p.init_clock = function() {
		// Initializes the clock backend.
		this._clock.initialize;
	};

	p.init_display = function() {
		// Initializes the canvas backend.
		this._canvas.init_display(this);

		this._python_workspace['win'] = window;
	};

	p.init_heartbeat = function() {
		// Initializes heartbeat.
		if ((this.heartbeat_interval <= 0) || (this.vars.fullscreen == 'yes') || (this.output_channel == null)) {
			this.heartbeat = null;
		} else {
			this.heartbeat = new osweb.heartbeat(this, 1);
			this.heartbeat.start();
		}
	};

	p.init_log = function() {
		// Open a connection to the log file.
		this._log.open(this.logfile);
	};

	p.init_random = function() {
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

	p.init_sound = function() {
		// Intializes the sound backend.
		/* from openexp import sampler
		sampler.init_sound(self) */
	};

	/*
	 * Definition of public methods - running item.         
	 */

	p.run = function() {
		// Inherited.	
		this.item_run();

		// Runs the experiment.
		switch (this._status) {
			case osweb.constants.STATUS_INITIALIZE:

				// Set the status to finalize.
				this._status = osweb.constants.STATUS_FINALIZE;

				// Save the date and time, and the version of OpenSesame
				this.vars.datetime = new Date().toString();
				this.vars.opensesame_version = osweb.VERSION_NUMBER;
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

				if (osweb.item_store._items[this.vars.start] != null) {
					osweb.item_stack.clear();
					osweb.item_store.prepare(this.vars.start, this);
					//osweb.item_store.execute(this.vars.start, this);
				} else {
					osweb.debug.addError('Could not find item ' + self.vars.start + ' , which is the entry point of the experiment');
				}

				break;
			case osweb.constants.STATUS_FINALIZE:

				// Add closing message to debug system.
				osweb.debug.addMessage('experiment.run(): experiment finished at ' + new Date().toUTCString());

				// Complete the run process.
				this.end();

				break;
		};
	};

	p.end = function() {
		// Disable the run toggle.
		this.running = false;

		// Close the log file.
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
	return osweb.promoteClass(experiment, "item");
}
