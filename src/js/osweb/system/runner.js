// Definition of the class runner - core module to run an Osexp experiment.
module.exports = function(osweb){
    "use strict";
    function runner() {
        throw 'The class runner cannot be instantiated!';
    };

    // Definition of private properties.
    runner._canvas = null; // Canvas on which the experiment is shown.
    runner._onfinished = null; // Event triggered on finishing the experiment.
    runner._script = null; // Container for the script definition of the experiment.
    runner._source = null; // Link to the source experiment file. 
    runner._stage = null; // Link to the stage object (EASELJS).
    runner._target = null; // Link to the target location for thr data. 
    runner._subject = null; // Subject number (if given no dialog is shown)

    // Definition of public properties.
    runner.data = null; // Container for the result data.
    runner.debug = false; // Debug toggle.
    runner.experiment = null; // The root experiment object to run.           
    runner.status = osweb.constants.RUNNER_NONE; // Status of the runner.

    // Definition of private methods - setup runner.      

    runner._setupContent = function(content) {
        // Check if the experiment container is defined.                     
        if (typeof content !== "undefined") {
            // Get the canvas from the DOM element tree.
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
            this._onfinished = (typeof context.onfinished !== 'undefined') ? context.onfinished : null;
            this._source = (typeof context.source !== 'undefined') ? context.source : null;
            this._subject = (typeof context.subject !== 'undefined') ? context.subject : null;
            this._target = (typeof context.target !== 'undefined') ? context.target : null;
            
            // Build the introduction screen.
            osweb.screen._active = (typeof context.introscreen !== 'undefined') ? context.introscreen : true;
            osweb.screen._click = (typeof context.introclick !== 'undefined') ? context.introclick : true;
            osweb.screen._setupIntroScreen();

            // Load the script file, using the source parameter.
            osweb.transfer._readOsexpFile(this._source);
        } 
        else {
            osweb.debug.addError(osweb.constants.ERROR_003);
        }
    };

    // Definition of the private methods - build cycle.      

    runner._build = function() {
        // Set status of the runner.
        this.status = osweb.constants.RUNNER_READY;
        
        // Build the base experiment object.
        this.experiment = new osweb.experiment(null, 'test', this._script);

        // Build the global static object classes.
        window['exp'] = this.experiment;
        window['items'] = osweb.item_store;
        window['pool'] = osweb.file_pole_store;
        window['var'] = this.experiment.vars;

        // Pepare the experiment to run.
        this._prepare();
    };

    // Definition of private methods - prepare cycle.   
                   
    runner._prepare = function() {
        // Update inroscreen.
        osweb.screen._updateIntroScreen(osweb.constants.MESSAGE_005);

        // Initialize the helper classes.
        osweb.python._initialize();
        osweb.session._initialize();
        osweb.parameters._initialize();
    };

    // Definition of private methods - run cycle.   

    runner._initialize = function() {
        // Initialize the debugger. 
        osweb.debug._initialize();

        // Initialize the event system.
        osweb.events._initialize();

        // Set status of the runner.
        this.status = osweb.constants.RUNNER_RUNNING;

        // Prepare and execute the experiment item.
        this.experiment.prepare();
        this.experiment.run();
    };

    runner._finalize = function() {
        // Finalize the event system.
        osweb.events._finalize();

        // Finalize the debugger.
        osweb.debug._finalize();

        // Exit the runner.          
        this._exit();
    };

    runner._exit = function() {
        // Clear the canvas.
        this._stage.clear();

        // Set the cursor visibility to default (visible).
        this._stage.canvas.style.cursor = "default";

        // Write result data to target location (if defined).
        osweb.transfer._writeDataFile(this._target, this.data);

        // Check if a callback function is defined. 
        if (this._onfinished) {
            // Execute callback function.
            this._onfinished(this.data, osweb.session._session);
        }
    };

    // Definition of public methods - run cycle.      

    runner.exit = function() {
        // Set status of the runner.
        this.status = osweb.constants.RUNNER_BREAK;
        
        // Set break flag in the events class.
        osweb.events._break = true;
    };

    runner.run = function(content, context) {
        // Initialize the content container.
        this._setupContent(content);

        // Initialize the context parameter
        this._setupContext(context);
    };

    // Bind the runner class to the osweb namespace.
    return runner;
}