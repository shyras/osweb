/** Class representing a information stream processor. */
export default class Transfer {
    /**
     * Create a transfer object used for streaming information.
     * @param {Object} runner - The runner class to which the transfer belongs.
     */
    constructor(runner) {
        // Create and set private properties. 
        this._counter = 0;   // Counter used for processing the pool items.
        this._runner = runner; // Parent runner attached to the transfer object.    
        this._filePool = null; // Array containg the items.    
    }   

    /** 
     * Read na osexp file.
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
                if (source.substr(0,3) === '---') {
                    // Disable the progressbar.    
                    this._runner._screen._updateProgressBar(100);

                    // Set the script paramter.
                    this._runner._script = source;
                    
                    // Start buiding the experiment.
                    this._runner._build();
                } else {
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
                this._runner._screen._updateProgressBar((event.loaded / event.total) );
            }.bind(this),
            function(event) {
                this._runner._debugger.addError('Error reading local osexp.');
            }.bind(this)
        );
    }   

    /**
     * Reading and extracting an osexp file from a server location.
     * @param {String} url - An url location from which to load an osexp file.
     */
    _readOsexpFromServer(url) {
        // Reading and extracting an osexp file from a server location.
        TarGZ.load(url, 
            function(event) {
                this._runner._screen._updateProgressBar(100);
                this._processOsexpFile(event);
            }.bind(this),
            function(event) {
                this._runner._screen._updateProgressBar((event.loaded / event.total) );
            }.bind(this),
            function(event) {
                this._runner._debugger.addError('Error reading server osexp file: ' + url);
            }.bind(this)
        );
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
        files.splice(0,2);
        this._filePool = files;

        // Process the individual pool files.
        this._processOsexpPoolItems();
    } 

    /** Process the individual pool file items. */
    _processOsexpPoolItems() {
        if (this._counter < this._filePool.length)
        {
            // Create a file pool element.
            var item = {
                data: null,
                folder: this._filePool[this._counter].filename,
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
        }    
        else
        {
            // Clear the variables.
            this._filePool = null;    
            
            // All files have been process, start the experiment process.
            this._runner._screen._updateProgressBar(100);
            this._runner._screen._updateIntroScreen('Building experiment structure.');

            // Continue the experiment build.
            this._runner._build();
        }    
    }

    /**
     * Writing experiment result data to a location.
     * @param {String} target - An addres to store result data.
     * @param {Object} resultData - The result data itself to store.
     */
     _writeDataFile(target, resultData) {
        // Check if the target and resultData are defined.
        if ((target !== null) && (resultData !== null))
        {
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
 