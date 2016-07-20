(function() {
    // Definition of the class runner.
    function runner() {
        throw 'The class runner cannot be instantiated!';
    };

    // Show library name and library version number in the console.
    console.log(osweb.VERSION_NAME + ' - ' + osweb.VERSION_NUMBER);

    // Definition of private properties.
    runner._canvas = null; // Canvas on which the experiment is shown.
    runner._qualtrics = null; // Link to the qualtrics interface (optional)
    runner._stage = null; // Links to the stage object (CreateJS).

    // Definition of public properties.
    runner.data = null; // Container for the experiment result data (if defined).
    runner.debug = false; // Debug toggle.
    runner.experiment = null; // The root experiment object to run.           
    runner.onFinished = null; // Event triggered on finishing the experiment.
    runner.screenIntro = true; // Show introscreen toggle.
    runner.screenClick = true; // Show clickscreen toggle
    runner.script = null; // Container for the JSON script definition of the experiment.
    runner.scriptID = 0; // Id used when retrieving the script from the database.
    runner.scriptURL = ''; // Path pointing to the AMFPHP database files.
    runner.session = null; // Container for the JSON session information.

    /*
    // Definition of private methods - setup runner.      
     */

    runner._setupContent = function(content) {
        // Check if the experiment container is defined.                     
        if (typeof content !== "undefined") {
            // Get the canvas from the DOM Element tree.
            this._canvas = (typeof content === 'string') ? document.getElementById(content) : content;

            // Set the stage object (easelJS). 
            this._stage = new createjs.Stage(this._canvas);
            this._stage.snapToPixelEnabled = true;
            this._stage.regX = -.5;
            this._stage.regY = -.5;

            // Build the initialization screen.
            this._setupIntroScreen();
        } else {
            osweb.debug.addError(osweb.constants.ERROR_002);
        }
    };

    runner._setupContext = function(context) {
        // Check if the script parameter is defined.                        
        if (typeof context !== "undefined") {
            // Initialize the context parameters.
            this.debug = (typeof context.debug !== 'undefined') ? context.debug : false;
            this.file = (typeof context.file !== 'undefined') ? context.file : null;
            this.onFinished = (typeof context.onFinished !== 'undefined') ? context.onFinished : null;
            this.screenClick = (typeof context.screenClick !== 'undefined') ? context.screenClick : true;
            this.screenIntro = (typeof context.screenIntro !== 'undefined') ? context.screenIntro : true;
            this.script = (typeof context.script !== 'undefined') ? context.script : null;
            this.scriptID = (typeof context.scriptID !== 'undefined') ? context.scriptID : 0;
            this.scriptURL = (typeof context.scriptURL !== 'undefined') ? context.scriptURL : '';
            this.session = (typeof context.session !== 'undefined') ? context.session : null;

            // Check if an osexp script is given as parameter.                            
            if (this.script !== null) {
                // Start building the experiment structure.      
                this._buildExperiment();
            }
            // Check if an osexp file is given as parameter. 
            else if (this.file !== null) {
                this._setupScriptFromFile();
            } else {
                // Retrieve the script from an external location.
                this._setupScriptFromDatabase();
            }
        } else {
            osweb.debug.addError(osweb.constants.ERROR_003);
        }
    };

    runner._setupScriptFromFile = function() {
        // Check for binary or text file definition.
        if (this.file.substring(0, 3) == '---') {
            this.script = String(this.file);
        } else {
            // Decompress the gizp file and splitt the tar result.	
            GZip.loadlocal(this.file, function(h) {
                var tar = new TarGZ;
                tar.parseTar(h.data.join(''));
                tar.files.forEach(this.setupScriptFromFileResult.bind(this));
            }.bind(this), this.setupScriptFromFileProgress, this.setupScriptFromFileAlert);
        }

        // Start building the experiment structure.      
        this._buildExperiment();
    };

    runner.setupScriptFromFileAlert = function() {};

    runner.setupScriptFromFileProgress = function() {};

    runner.setupScriptFromFileResult = function(pFile) {
        // Check if the file is the scriptfile.
        if (pFile.filename === 'script.opensesame') {
            // Create the script.
            this.script = String(pFile.data);
        } else if ((pFile.data !== null) && (pFile.data !== '')) {
            // Create a file pool element.
            osweb.pool.add_from_local_source(pFile);
        }
    };

    runner._setupScriptFromDatabase = function() {
        // Check if the URL and ID is propertly defined.
        if ((this.scriptID >= 0) && (this.scriptURL !== '')) {
            var url = this.scriptURL + '/php/index.php?/ajax/group/get_status';
            var parameters = {
                group_id: 99,
                task_number: this.scriptID
            };

            new Ajax.Request(url, {
                parameters: parameters,
                onCreate: function(response) {
                    var t = response.transport;
                    t.setRequestHeader = t.setRequestHeader.wrap(function(original, k, v) {
                        if (/^(accept|accept-language|content-language)$/i.test(k))
                            return original(k, v);
                        if (/^content-type$/i.test(k) &&
                            /^(application\/x-www-form-urlencoded|multipart\/form-data|text\/plain)(;.+)?$/i.test(v))
                            return original(k, v);
                        return;
                    });
                },
                onSuccess: function(transport) {
                    // Process the response
                    if (transport.responseText) {
                        // Retrieve the response text.
                        var jsonresponse = JSON.parse(transport.responseText);

                        // Check if the task is available.
                        if (jsonresponse.task_available === '1') {
                            // Set the script parameter.
                            this.script = jsonresponse.data_available;
                            this.files = jsonresponse.file_available.split('\r\n');

                            // Create a file pool element.
                            osweb.pool.add_from_server_source(this.scriptURL + '/user/4/', this.files);
                        } else {
                            // Show erorr message within the concole.
                            osweb.debug.addError(osweb.constants.ERROR_007);
                        }
                    } else {
                        // Show erorr message within the concole.
                        osweb.debug.addError(osweb.constants.ERROR_006);
                    }
                }.bind(this),
                onFailure: function() {
                    // Show erorr message within the concole.
                    osweb.debug.addError(osweb.constants.ERROR_005);
                }.bind(this)
            });
        } else {
            // Show erorr message within the concole.
            osweb.debug.addError(osweb.constants.ERROR_004);
        }
    };

    // Definition of private methods - Introduction screen.

    runner._setupIntroScreen = function() {
        // Set the introscreen elements.
        if (this.screenIntro === true) {
            this._introScreen = new createjs.Shape();
            this._introScreen.graphics.beginFill('#000000').drawRect(0, 0, this._stage.width, this._stage.height);
            this._introLine = new createjs.Shape();
            this._introLine.graphics.beginFill('#AAAAAA').drawRect(200, 155, 400, 1);
            this._introText1 = new createjs.Text('OS', "24px bold Times", "#FF0000");
            this._introText1.x = 200;
            this._introText1.y = 135;
            this._introText2 = new createjs.Text(osweb.constants.MESSAGE_002 + osweb.VERSION_NUMBER, "14px Arial", "#FFFFFF");
            this._introText2.x = 231;
            this._introText2.y = 142;
            this._introText3 = new createjs.Text(osweb.constants.MESSAGE_003, "12px Arial", "#FFFFFF");
            this._introText3.x = 200;
            this._introText3.y = 168;
            this._stage.addChild(this._introScreen, this._introLine, this._introText1, this._introText2, this._introText3);
            this._stage.update();
        }
    };

    runner._clearIntroScreen = function() {
        // Update the introscreen elements.
        if (this.screenIntro === true) {
            this._stage.removeChild(this._introScreen, this._introLine, this._introText1, this._introText2, this._introText3);
            this._stage.update();
        }
    };

    runner._updateIntroScreen = function(text) {
        // Update the introscreen elements.
        if (this.screenIntro === true) {
            this._introText3.text = text;
            this._stage.update();
        }
    };

    // Definition of the private methods - build cycle.      

    runner._buildExperiment = function() {
        // Build the base experiment object.
        this.experiment = new osweb.experiment(null, 'test', this.script);

        // Create the global static object classes.
        window['items'] = osweb.item_store;
        window['pool'] = osweb.file_pole_store;
        window['vars'] = this.experiment.vars;

        // Pepare the experiment to run.
        this._prepare();
    };

    // Definition of private methods - prepare cycle.   

    runner._prepare = function() {
        // Update inroscreen.
        this._updateIntroScreen(osweb.constants.MESSAGE_004);

        // Start the stimuli loader.
        osweb.parameters._initialize();
        osweb.functions._initialize();
        osweb.python_workspace_api._initialize();
        osweb.session._initialize();

        // Start the parameter screen (subject number).
        this._prepareParameters();
    };

    runner._prepareParameters = function() {
        // Update inroscreen.
        this._updateIntroScreen(osweb.constants.MESSAGE_005);

        // Check if items must be processed. 
        if (osweb.parameters._parameters.length > 0) {
            // Process the Parameters.        
            osweb.parameters._processParameters();
        } else {
            // Start the experiment.
            this._prepareStartScreen();
        }
    };

    runner._prepareStartScreen = function() {
        // Check if the experiment must be clicked to start.
        if (this.screenClick === true) {
            // Update inroscreen.
            this._updateIntroScreen(osweb.constants.MESSAGE_006);

            // Setup the mouse click response handler.
            var clickHandler = function(event) {
                // Remove the handler.
                this._canvas.removeEventListener("click", clickHandler);

                // Finalize the introscreen elements.
                this._clearIntroScreen();

                // Start the task.
                this._initialize();
            }.bind(this);

            // Set the temporary mouse click.
            this._canvas.addEventListener("click", clickHandler, false);
        } else {
            // Finalize the introscreen elements.
            this._clearIntroScreen();

            // Start the runner.
            this._initialize();
        }
    };

    // Definition of private methods - run cycle.   

    runner._initialize = function() {
        // Initialize the debugger. 
        osweb.debug._initialize();

        // Initialize the devices.
        osweb.events._initialize();

        // Prepare and execute the experiment item.
        this.experiment.prepare();
        this.experiment.run();
    };

    runner._finalize = function() {
        // Finalize the devices.
        osweb.events._finalize();

        // Finalize the debugger.
        osweb.debug._finalize();

        // Exit the application.
        this._exit();
    };

    runner._exit = function() {
        // Clear the canvas.
        this._stage.clear();

        // Set the cursor visibility to default.
        this._stage.canvas.style.cursor = "default";

        // Check if an event handler is attached.
        if (this.onFinished) {
            // Execute.
            this.onFinished(this.data, osweb.session._session);
        }
    };

    // Definition of public methods - run cycle.      

    runner.run = function(content, context) {
        // Initialize the content container.
        this._setupContent(content);

        // Initialize the context parameter
        this._setupContext(context);
    };

    // Bind the runner class to the osweb namespace.
    osweb.runner = runner;
}());