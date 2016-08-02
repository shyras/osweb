(function() {
    // Definition of the class runner.
    function runner() {
        throw 'The class runner cannot be instantiated!';
    };

    // Show library name and library version number in the console.
    console.log(osweb.VERSION_NAME + ' - ' + osweb.VERSION_NUMBER);

    // Definition of private properties.
    runner._canvas = null; // Canvas on which the experiment is shown.
    runner._stage = null; // Links to the stage object (CreateJS).

    // Definition of public properties.
    runner.break = false; // Exit flag.
    runner.data = null; // Container for the experiment result data (if defined).
    runner.debug = false; // Debug toggle.
    runner.experiment = null; // The root experiment object to run.           
    runner.onFinished = null; // Event triggered on finishing the experiment.
    runner.screenIntro = true; // Show introscreen toggle.
    runner.screenClick = true; // Show clickscreen toggle
    runner.script = null; // Container for the JSON script definition of the experiment.
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

        } else {
            osweb.debug.addError(osweb.constants.ERROR_002);
        }
    };

    runner._setupContext = function(context) {
        // Check if the script parameter is defined.                        
        if (typeof context !== "undefined") {
            // Initialize the context parameters.
            this.debug = (typeof context.debug !== 'undefined') ? context.debug : false;
            this.onFinished = (typeof context.onFinished !== 'undefined') ? context.onFinished : null;
            this.session = (typeof context.session !== 'undefined') ? context.session : null;
            this.source = (typeof context.source !== 'undefined') ? context.source : null;
            this.target = (typeof context.target !== 'undefined') ? context.target : null;
            
            // Build the initialization screen.
            osweb.screen._active = (typeof context.screenIntro !== 'undefined') ? context.screenIntro : true;
            osweb.screen._click = (typeof context.screenClick !== 'undefined') ? context.screenClick : true;
            osweb.screen._setupIntroScreen();

            // Load the script file, using the source parameter.
            osweb.transfer._readOsexpFile(this.source);
        } 
        else {
            osweb.debug.addError(osweb.constants.ERROR_003);
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
        osweb.screen._updateIntroScreen(osweb.constants.MESSAGE_004);

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
        osweb.screen._updateIntroScreen(osweb.constants.MESSAGE_005);

        // Check if items must be processed. 
        if (osweb.parameters._parameters.length > 0) {
            // Process the Parameters.        
            osweb.parameters._processParameters();
        } else {
            // Start the experiment.
            osweb.screen._setupClickScreen();
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

        // Write result data to server.
        osweb.transfer._writeDataFile(this.target, this.data);

        // Check if an event handler is attached.
        if (this.onFinished) {
            // Execute.
            this.onFinished(this.data, osweb.session._session);
        }
    };

    // Definition of public methods - run cycle.      

    runner.exit = function() {
        // Set break flag
        osweb.runner.break = true;
    };

    runner.run = function(content, context) {
        // Initialize the content container.
        this._setupContent(content);

        // Initialize the context parameter
        this._setupContext(context);
    };

    // Bind the runner class to the osweb namespace.
    osweb.runner = runner;
}());