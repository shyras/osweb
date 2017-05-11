import Item from './item.js';
import Canvas from '../backends/canvas.js';
import Log from '../backends/log';
import { constants } from '../system/constants.js';
import { VERSION_NAME, VERSION_NUMBER } from '../index.js';

/**
 * Class representing an Experiment item. 
 * @extends Item
 */
export default class Experiment extends Item {
	/** The experiment class defines the starting point for an experiment. */
	constructor(experiment, name, script) {
		// Inherited.
		super(experiment, name, script)

		// Create and set private properties. 
		this._canvas = new Canvas(this);
		this._currentCanvas = this._canvas;
		this._log = new Log(this);
		this._scale_x = 1; // Scaling of the canvas for fullscreen mode.
		this._scale_y = 1; // Scaling of the canvas for fullscreen mode.

		// Create and set public properties. 
		this.debug = this._runner._debugger.enabled;
		this.items = this._runner._itemStore;
		this.pool = this._runner._pool;
	
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
		this.vars.background = 0x000000;
		this.vars.foreground = 0xFFFFFF;

		// Font parameters.
		this.vars.font_size = 18;
		this.vars.font_family = 'mono';
		this.vars.font_italic = 'no';
		this.vars.font_bold = 'no';
		this.vars.font_underline = 'no';
	}

	/** Resets the feedback variables (acc, avg_rt, etc.). */
	reset_feedback() {
		this.vars.total_responses = 0;
		this.vars.total_correct = 0;
		this.vars.total_response_time = 0;
		this.vars.avg_rt = 'undefined';
		this.vars.average_response_time = 'undefined';
		this.vars.accuracy = 'undefined';
		this.vars.acc = 'undefined';
	}

	/**
	 * Sets the subject number and parity (even/ odd).
	 * @param  {Number} pNr - The subject number to be used.
	 */
	set_subject(pNr) {
		// Sets the subject number and parity (even/ odd). 
		this.vars.subject_nr = pNr;
		if ((pNr % 2) === 0) {
			this.vars.subject_parity = 'even';
		} else {
			this.vars.subject_parity = 'odd';
		}
	}

	/**
	 * Extracts a the definition of a single item from the string.
	 * @param {String} script - The script to read the definition form.
	 * @return {String} - The definition found from the script.
	 */
	read_definition(script) {
		// Extracts a the definition of a single item from the string.
		var line = script.shift();
		var def_str = '';
		while ((line !== null) && (line.length > 0) && (line.charAt(0) === '\t')) {
			def_str = def_str + line.substring(1) + '\n';
			line = script.shift();
		}
		return def_str;
	}

	/**
	 * Construct the experiment object from OpenSesame script.
	 * @param {String} script - The opensesame script contents
	 */
	from_string(script) {
		// Split the string into an array of lines.
		if (script !== null) {
			this._source = script.split('\n');
			var l = this._source.shift();
			while (l != null) {
				// Set the processing of the next line.
				var get_next = true;
				try {
					var cmd, args, kwargs;
					// Split the single line into a set of tokens.
					[cmd, args, kwargs] = this._runner._syntax.parse_cmd(l);
				} catch (e) {
					this._runner._debugger.addError('Failed to parse script. Maybe it contains illegal characters or unclosed quotes: ' + e.message);
				}

				if ((cmd !== null) && (args.length > 0)) {
					// Try to parse the line as variable (or comment)
					if (this.parse_variable(l) === false) {
						if (cmd === 'define') {
							if (args.length === 2) {
								// Get the type, name and definition string of an item.
								var item_type = args[0];
								var item_name = this._runner._syntax.sanitize(args[1]);
								var def_str = this.read_definition(this._source);
								this._runner._itemStore.newItem(item_type, item_name, def_str);
							} else {
								this._runner._debugger.addError('Failed to parse definition: ' + l);
							}
						}
					}
				}

				// Get the next line.
				if (get_next === true) {
					l = this._source.shift();
				}
			}
		}
	}

	/** Initializes the clock backend. */
	init_clock() {
		// Initializes the clock backend.
		this.clock._initialize();
	}

	/** Initializes the canvas backend. */
	init_display() {
		// Initializes the canvas backend.
		this._canvas.init_display(this);
	}

	/** Open a connection to the log file. */
	init_log() {
		this._log.open();
	}

	/** Event handler for external data retrieval. */
	onLog(data){
		// Function to be overwritten by external handler
	}

	/** Implements the run phase of an item. */
	run() {
		// Inherited.	
		super.run();

		// Runs the experiment.
		switch (this._status) {
			case constants.STATUS_INITIALIZE:
				// Adjust the status of the item.
				this._status = constants.STATUS_FINALIZE;

				// Save the date and time, and the version of OpenSesame
				this.vars.datetime = new Date().toString();
				this.vars.opensesame_version = VERSION_NUMBER;
				this.vars.opensesame_codename = VERSION_NAME;
				this.init_clock();
				this.init_display();
				this.init_log();
				this.reset_feedback();

				// Add closing message to debug system.
				this._runner._debugger.addMessage('experiment.run(): experiment started at ' + new Date().toUTCString());

				if (this._runner._itemStore._items[this.vars.start] !== null) {
					this._runner._itemStack.clear();
					this._runner._itemStore.prepare(this.vars.start, this);
				} else {
					this._runner._debugger.addError('Could not find the item that is the entry point of the experiment: ' + this.vars.start);
				}
				break;
			case constants.STATUS_FINALIZE:
				// Add closing message to debug system.
				this._runner._debugger.addMessage('experiment.run(): experiment finished at ' + new Date().toUTCString());

				// Complete the run process.
				this.end();
				break;
		}
	}

	/** Ends an experiment. */
	end() {
		// Close the log file.
		this._log.close();

		// Finalize the parent (runner).	
		this._runner._finalize();
	}
}
 