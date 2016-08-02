(function() {
    // Definition of the class transfer - tranfer information from/to file/server.
    function transfer() {
        throw 'The class transfer cannot be instantiated!';
    }

    // Definition of private properties.
    transfer._counter = null;   // Counter used for processing the pool items.
    transfer._poolfiles = null; // Array containg the pool items.           

    // Definition of private methods.   

    transfer._readOsexpFile = function(source) {    
        osweb.screen._updateIntroScreen('Loading experiment');
        osweb.screen._updateProgressBar(-1);
        
        // Check type of object.
        if (source.constructor === File) {
            // Source is a local loaded file, load binary.
            this._readOsexpFromFile(source);
        }    
        else {
            // Check if the source is a script string.
            if (source.substr(0,3) === '---') {
                // Set the script paramter.
                osweb.runner.script = source;
                
                // Start buiding the experiment.
                osweb.runner._buildExperiment();
            }
            else {
                // Server source, check if the url is valid
                this._readOsexpFromServer(source);
            }
        }    
    };

    transfer._readOsexpFromFile = function(file) {
        // Reading and extracting an osexp file from a file location.
        TarGZ.loadLocal(file, 
            function(event) {
                osweb.screen._updateProgressBar(100);
                this._processOsexpFile(event);
            }.bind(this),
            function(event) {
                //osweb.runner._updateIntroScreen('loading experiment: ' + Math.round((event.loaded / event.total) * 100) + '%.');
                osweb.screen._updateProgressBar((event.loaded / event.total) );
            }.bind(this),
            function(event) {
                console.log('error');
            }.bind(this));
    };   

    transfer._readOsexpFromServer = function(url) {
        // Reading and extracting an osexp file from a server location.
        TarGZ.load(url, 
            function(event) {
                osweb.screen._updateProgressBar(100);
                this._processOsexpFile(event);
            }.bind(this),
            function(event) {
                osweb.screen._updateProgressBar((event.loaded / event.total) );
                //osweb.runner._updateIntroScreen('loading experiment: ' + Math.round((event.loaded / event.total) * 100) + '%.');
            }.bind(this),
            function(event) {
                console.log('error');
            }.bind(this));
    };   

    transfer._processOsexpFile = function(files) {
        // Update the intro screen.
        osweb.screen._updateIntroScreen('Building stimuli files');
        osweb.screen._updateProgressBar(-1);
      
        // First get the first element, which is the script.
        osweb.runner.script = files[0].data; 
    
        // Remove the script and the folder (pool) items.
        this.counter = 0;
        files.splice(0,2);
        this.poolfiles = files;
    
        // Process the individual pool files.
        this._processOsexpPoolItems();
    }; 

    transfer._processOsexpPoolItems = function() {
        if (this.counter < this.poolfiles.length)
        {
            // Create a file pool element.
            var item = {
                data: null,
                folder: this.poolfiles[this.counter].filename,
                name: this.poolfiles[this.counter].filename.replace(/^.*[\\\/]/, ''),
                size: this.poolfiles[this.counter].length,
                type: 'undefined'
            };    

            var ext = this.poolfiles[this.counter].filename.substr(this.poolfiles[this.counter].filename.lastIndexOf('.') + 1);
            if ((ext == 'jpg') || (ext == 'png')) {
                // Create a new file pool mage item.
                var img = new Image();
                img.src = this.poolfiles[this.counter].toDataURL();
                item.data = img;
                item.type = 'image';
            } else if ((ext == 'wav') || (ext == 'ogg')) {
                var ado = new Audio();
                ado.src = this.poolfiles[this.counter].toDataURL();
                item.data = ado;
                item.type = 'sound';
            } else if (ext == 'ogv') {
                var ado = document.createElement("VIDEO");
                ado.src = this.poolfiles[this.counter].toDataURL();
                item.data = ado;
                item.type = 'video';
            };
        
            // Add the item to the virtual pool.
            osweb.pool._add(item);
            
            // Updfate the progress bar.
            osweb.screen._updateProgressBar(this.counter / this.poolfiles.length);
            
            // Update the counter.
            this.counter++;

            // Time out caller to prevent blocking.
            setTimeout(function(){ this._processOsexpPoolItems(); }.bind(this), 10);
        }    
        else
        {
            // All files have been process, start the experiment process.
            osweb.screen._updateProgressBar(100);

            // Continue the experiment build.
            osweb.runner._buildExperiment();
        }    
    };

    // Bind the transfer class to the osweb namespace.
    osweb.transfer = transfer;
}());