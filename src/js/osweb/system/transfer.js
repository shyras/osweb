import WebFont from 'webfontloader';

/** Class representing a information stream processor. */
export default class Transfer {
	/**
	 * Create a transfer object used for streaming information.
	 * @param {Object} runner - The runner class to which the transfer belongs.
	 */
	constructor(runner) {
		// Create and set private properties. 
		this._counter = 0; // Counter used for processing the pool items.
		this._runner = runner; // Parent runner attached to the transfer object.    
		this._filePool = null; // Array containg the items.    
	}

	/** 
	 * Read an osexp file.
	 * @param {Object|String} source - A file object or a String containing the experiment.
	 */
	_readOsexpFile(source) {
		this._runner._screen._updateIntroScreen('Retrieving stimuli files.');
		this._runner._screen._updateProgressBar(-1);

		// Check type of object.
		if (source !== null) {
			if (source.constructor === File) {
				// Source is a local loaded file, load binary.
				this._readOsexpFromFile(source);
			} else {
				// Check if the source is a script string.
				if (!this._processScript(source)) {
					// Server source, check if the url is valid
					this._readOsexpFromServer(source);
				}
			}
		} else {
			this._runner._debugger.addError('No osexp source file defined.');
		}
	}

	/**
	 * Reading and extracting an osexp file from a file location.
	 * @param {Object} file - A file object containing the experiment.
	 */
	_readOsexpFromFile(file) {
		// Reading and extracting an osexp file from a file location.
		TarGZ.loadLocal(file,
			function(event) {
				this._runner._screen._updateProgressBar(100);
				this._processOsexpFile(event);
			}.bind(this),
			function(event) {
				this._runner._screen._updateProgressBar((event.loaded / event.total));
			}.bind(this),
			function(event) {
				this._runner._debugger.addError(`Error reading local osexp: ${event.message}`);
			}.bind(this)
		);
	}

	/**
	 * Reading and extracting an osexp file from a server location.
	 * @param {String} url - An url location from which to load an osexp file.
	 */
	_readOsexpFromServer(url) {
		// Osexp files can be basic text files, or be a zip file.
		// Check if mimetype of supplied file is known, and load it accordingly.
		if (this._runner._mimetype.indexOf('text/') != -1) {
			this._readRemoteOsexpText(url);
			return;
		}
		// Reading and extracting an osexp file from a server location.
		TarGZ.load(url,
			function(event) {
				this._runner._screen._updateProgressBar(100);
				this._processOsexpFile(event);
			}.bind(this),
			function(event) {
				this._runner._screen._updateProgressBar((event.loaded / event.total));
			}.bind(this),
			function(event) {
				this._runner._debugger.addError('Error reading server osexp file: ' + url);
			}.bind(this)
		);
	}

	/**
	 * Reads an osexp file from a remote server, if its type is indicated to be
	 * 'text/plain' (opposed to being zipped)
	 * @param  {string} url The url at which the osexp can be found
	 * @return {void}
	 */
	_readRemoteOsexpText(url) {
		const request = new XMLHttpRequest();

		// Transfer in progress, update of percentage.
		request.addEventListener("progress", (event) => {
			if (event.lengthComputable) {
				this._runner._screen._updateProgressBar(event.loaded / event.total);
			}
		});

		// Transfer finished.
		request.addEventListener("load", (event) => {
			this._processScript(request.response);
		});

		request.addEventListener("error", (e) => {
			throw new Error("Error transferring osexp: " + e);
		});

		request.open('GET', url, true);
		request.send();
	}

	/**
	 * Process the contence of an osexp file.
	 * @param {Array} files - A list of internal files extracted from the osexp file.
	 */
	_processOsexpFile(files) {
		// Update the intro screen.
		this._runner._screen._updateIntroScreen('Building stimuli files.');
		this._runner._screen._updateProgressBar(-1);

		// First get the first element, which is the script.
		this._runner._script = files[0].data;

		// Remove the script and the folder (pool) items.
		this._counter = 0;
		files.splice(0, 2);
		this._filePool = files;

		// Process the individual pool files.
		this._processOsexpPoolItems();
	}

	/**
	 * Process an osexp script
	 * @param  {string} contents - The script contents
	 * @return {boolean} - True if script was successfully processed, false otherwise
	 */
	_processScript(contents) {
		if (contents.substr(0, 3) === '---') {
			// Disable the progressbar.    
			this._runner._screen._updateProgressBar(100);

			// Set the script paramter.
			this._runner._script = contents;

			// Start buiding the experiment.
			this._readWebFonts();
			return true;
		} else {
			return false;
		}
	}

	/** Process the individual pool file items. */
	_processOsexpPoolItems() {
		if (this._counter < this._filePool.length) {
			// Create a file pool element.
			var item = {
				data: null,
				folder: this._filePool[this._counter].filename.match(/(.*)[\/\\]/)[1] || '',
				name: this._filePool[this._counter].filename.replace(/^.*[\\\/]/, ''),
				size: this._filePool[this._counter].length,
				type: 'undefined'
			};

			var ext = this._filePool[this._counter].filename.substr(this._filePool[this._counter].filename.lastIndexOf('.') + 1);
			if ((ext === 'jpg') || (ext === 'png')) {
				// Create a new file pool mage item.
				var img = new Image();
				img.src = this._filePool[this._counter].toDataURL();
				item.data = img;
				item.type = 'image';
			} else if ((ext === 'wav') || (ext === 'ogg')) {
				var ado = new Audio();
				ado.src = this._filePool[this._counter].toDataURL();
				item.data = ado;
				item.type = 'sound';
			} else if (ext === 'ogv') {
				var ado = document.createElement('VIDEO');
				ado.src = this._filePool[this._counter].toDataURL();
				item.data = ado;
				item.type = 'video';
			};

			// Add the item to the virtual pool.
			this._runner._pool.add(item);

			// Updfate the progress bar.
			this._runner._screen._updateProgressBar(this._counter / this._filePool.length);

			// Update the counter.
			this._counter++;

			// Time out caller to prevent blocking.
			setTimeout(function() {
				this._processOsexpPoolItems();
			}.bind(this), 10);
		} else {
			// Clear the variables.
			this._filePool = null;

			// Continue loading webfonts.
			this._readWebFonts();
		}
	}

	/** Read webfonts */
	_readWebFonts() {
		// Update the introscreen
		this._runner._screen._updateProgressBar(100);
		this._runner._screen._updateIntroScreen('Retrieving required webfonts.');

		// Load the required fonts using webfont.
		WebFont.load({
			google: {
				families: ['Droid Sans', 'Droid Serif', 'Droid Sans Mono'],
				urls: ['//fonts.googleapis.com/css?family=Droid Sans',
					'//fonts.googleapis.com/css?family=Droid Serif',
					'//fonts.googleapis.com/css?family=Droid Sans Mono'
				]
			},
			active: function() {
				this._readWebFontsDone();
			}.bind(this)
		});
	}

	/** Finished reading webfonts */
	_readWebFontsDone() {
		// Update the introscreen
		this._runner._screen._updateIntroScreen('Building experiment structure.');

		// Continue the experiment build.
		this._runner._build();
	}

	/**
	 * Writing experiment result data to a location.
	 * @param {String} target - An addres to store result data.
	 * @param {Object} resultData - The result data itself to store.
	 */
	_writeDataFile(target, resultData) {
		// Check if the target and resultData are defined.
		if ((target !== null) && (resultData !== null)) {
			// Add the data as a form element.
			var data = new FormData();
			data.append('data', resultData.toString());

			// Create the request.
			var xhr = new XMLHttpRequest();
			xhr.open('post', target + '?file=subject-' + this._runner._experiment.vars['subject_nr'], true);

			// Send the actual data.
			xhr.send(data);
		}
	}
}
