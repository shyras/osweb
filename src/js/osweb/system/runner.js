// Definition of the class runner - core module to run an Osexp experiment.
module.exports = function(osweb){
    "use strict";
    function runner() {
        throw 'The class runner cannot be instantiated!';
    };

    // Definition of private properties.
    runner._canvas = null; // Canvas on which the experiment is shown.
    runner._container = null; // Div element containing all the osweb HTML elements.
    runner._container_forms = null; // HTML form container.
    runner._container_video = null; // HTML video container. 
    runner._onconsole = null; // Event triggered on console output.
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

    /**
     * Setup the content container which shows all the visual output.
     * @param {String|Object} content - The content (div) on which the experiment output is projected.
     */
    runner._setupContent = function(content) {
        // Check if the experiment container is defined.                     
        if (typeof content !== "undefined") {
            // Get the div element from the DOM element tree 
            this._container = (typeof content === 'string') ? document.getElementById(content) : content;

            // Create and set the experiment canvas. 
            this._canvas = document.createElement('canvas');
            this._canvas.id = 'osweb_canvas';
            this._canvas.width = 800;
            this._canvas.height = 600;
            this._canvas.style.backgroundColor = '#000000';

            // Create the form and video containers. 
            this._container_forms = document.createElement('div');
            this._container_forms.id = 'osweb_form';
            this._container_forms.style.backgroundColor = '#000000';
            this._container_forms.style.display = 'none';
            this._container_forms.width = '100%';
            this._container_forms.height = '100%';

            // Create the form and video containers. 
            this._container_video = document.createElement('video'); 
            this._container_video.id = 'osweb_video';
            this._container_video.style.display = 'none';
            this._container_video.width = 800;
            this._container_video.height = 600;

            // Append the canvas to the container.
            this._container.appendChild(this._canvas);
            this._container.appendChild(this._container_forms);
            this._container.appendChild(this._container_video);

            // Set the stage object (easelJS). 
            this._stage = new createjs.Stage(this._canvas);
            this._stage.snapToPixelEnabled = true;
            this._stage.regX = -.5;
            this._stage.regY = -.5;

        } else {
            osweb.debug.addError(osweb.constants.ERROR_002);
        }
    };

    /**
     * Setup the context from which the experiment is created.
     * @param {Object} context - An JSON object containing information about the experiment.
     */
    runner._setupContext = function(context) {
        // Check if the script parameter is defined.                        
        if (typeof context !== "undefined") {
            // Initialize the context parameters.
            this.debug = (typeof context.debug !== 'undefined') ? context.debug : false;
            this._onconsole = (typeof context.onconsole !== 'undefined') ? context.onconsole : null;
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
        } else {
            osweb.debug.addError(osweb.constants.ERROR_003);
        }
    };

    /** Build the OpenSesame experiment. */
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

    /** Prepare the experiment environment. */
    runner._prepare = function() {
        // Update inroscreen.
        osweb.screen._updateIntroScreen(osweb.constants.MESSAGE_005);

        // Initialize the helper classes.
        osweb.python._initialize();
        osweb.session._initialize();
        osweb.parameters._initialize();
    };

    /** Initialize the experiment environment. */
    runner._initialize = function() {
        // Initialize the debugger. 
        osweb.debug._initialize();

        // Initialize the event system.
        osweb.events._initialize();

        // Set status of the runner.
        this.status = osweb.constants.RUNNER_RUNNING;

        // Set the stage object.
        this._stage.clear();
        this._stage.update();
        
        // Prepare and execute the experiment item.
        this.experiment.prepare();
        this.experiment.run();
    };

    /** Finalize the experiment environment. */
    runner._finalize = function() {
        // Finalize the event system.
        osweb.events._finalize();

        // Finalize the debugger.
        osweb.debug._finalize();

        // Exit the runner.          
        this._exit();
    };

    /** Exit the experiment environment and execute the callback (optional). */
    runner._exit = function() {
        // Clear the canvas.
        this._stage.clear();

        // Set the cursor visibility to default (visible).
        this._stage.canvas.style.cursor = "default";

        // Remove the canvas from the container.
        this._container.removeChild(this._canvas);
        this._container.removeChild(this._container_forms);
        this._container.removeChild(this._container_video);

        // Write result data to target location (if defined).
        osweb.transfer._writeDataFile(this._target, this.data);

        // Check if a callback function is defined. 
        if (this._onfinished) {
            // Execute callback function.
            this._onfinished(this.data, osweb.session._session);
        }
    };
    
    /** Exit a running OpenSesame experiment. */
    runner.exit = function() {
        // Set status of the runner.
        this.status = osweb.constants.RUNNER_BREAK;
        
        // Set break flag in the events class.
        osweb.events._break = true;
    };
 
   /**
     * Run an OpenSesame experiment.
     * @param {String|Object} content - The content (div) on which the experiment output is projected.
     * @param {Object} context - An JSON object containing information about the experiment.
     */
    runner.run = function(content, context) {
        // Initialize the content container.
        this._setupContent(content);

        // Initialize the context parameter
        this._setupContext(context);
    };

    // Bind the runner class to the osweb namespace.
    return runner;
}