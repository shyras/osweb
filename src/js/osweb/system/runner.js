import * as PIXI from 'pixi.js';

import {
    constants
} from './constants.js'

import Debugger from './debugger.js';
import Events from './events.js';
import Parameters from './parameters.js';
import Screen from './screen.js';
import Session from './session.js';
import Transfer from './transfer.js';

import ItemStack from '../classes/item_stack.js';
import ItemStore from '../classes/item_store.js';
import PythonWorkspace from '../classes/python_workspace.js';
import FilePoolStore from '../classes/file_pool_store.js';
import Syntax from '../classes/syntax.js';

import PythonParser from '../python/python.js';

import Experiment from '../items/experiment.js';


/** Class representing the Runner. */
export default class Runner {
    /** Create a runner which runs an experiment. */
    constructor(content) {
        // Create and set private properties.
        this._confirm = null;
        this._container = null; // HTML: The container (div) element. 
        this._data = null // Experiment result data.
        this._formContainer; // ZEBRAKIT: Container for form display. 
        this._fullscreen = false;
        this._experiment = null; // The JSON experiment container     
        this._name = ''; // String name of the experiment which is run.
        this._prompt = null;
        this._onLog = null; // Function to call when logger is encountered.
        this._onfinished = null; // Event triggered on finishing the experiment.
        this._renderer = null; // PIXI: The visual stimuli renderer.
        this._script = null; // Container for the script definition of the experiment.
        this._source = null; // Link to the source experiment file. 
        this._target = null; // Link to the target location for thr data. 

        // Create and set private class properties.
        this._debugger = new Debugger(this); // Internal error system.
        this._events = new Events(this); // The event processor. 
        this._itemStack = new ItemStack(this); // The global item stack.
        this._itemStore = new ItemStore(this); // The global item store.
        this._parameters = new Parameters(this); // Parameter processor.
        this._pythonParser = new PythonParser(this); // Python parser
        this._pythonWorkspace = new PythonWorkspace(this); // Python workspace.
        this._pool = new FilePoolStore(this); // The virtual file pool store.    
        this._screen = new Screen(this); // Introduction screen renderer.
        this._session = new Session(this); // Session information container.
        this._syntax = new Syntax(this); // The script syntax checker.
        this._transfer = new Transfer(this); // File transfer system.

        // Create the content container. 
        this._setupContent(content);
    }

    /**
     * Setup the content container which shows all the visual output.
     * @param {String|Object} content - The content (div element) in which the experiment  is projected.
     */
    _setupContent(content) {
        // Check if the experiment container is defined.                     
        if (typeof content !== 'undefined') {
            // Get the div element from the DOM element tree 
            this._container = (typeof content === 'string') ? document.getElementById(content) : content;

            // Create theform container.
            this._formContainer = document.createElement("canvas");
            this._formContainer.id = 'osweb_formcanvas';
            this._container.appendChild(this._formContainer);
            this._formContainer.style.display = ' none';
            this._formCanvas = new zebra.ui.zCanvas('osweb_formcanvas', 800, 600);

            // Create and set the experiment canvas. 
            this._renderer = PIXI.autoDetectRenderer(800, 600, {
                antialias: true,
                transparent: false,
                resolution: 1
            });
            this._renderer.backgroundColor = 0x000000;

            // Append the canvas to the container.
            this._container.appendChild(this._renderer.view);

        } else {
            // Show error message.
            this._debugger.addError('No content parameter specified.');
        }
    }

    /**
     * Setup the context from which the experiment is created.
     * @param {Object} context - An JSON object containing information about the experiment.
     */
    _setupContext(context) {
        // Check if the script parameter is defined.                        
        if ((typeof context !== 'undefined') || (context === null)) {
            // Initialize the context parameters.
            // Use ES6 destructuring to determine values and set default ones if
            // required.
            ({
                confirm: this._confirm = null,
                debug: this._debugger.enabled = false,
                onconsole: this._onconsole = null,
                onfinished: this._onfinished = null,
                onlog: this._onLog = null,
                fullscreen: this._fullscreen = false,
                name: this._name = "noname.exp",
                source: this._source = null,
                mimetype: this._mimetype = null,
                subject: this._subject = null,
                target: this._target = null,
                prompt: this._prompt = null,
                introscreen: this._screen._active = true,
                introclick: this._screen_click = true
            } = context);

            // Set up the introscreen.
            this._screen._setupIntroScreen();

            // Load the script file, using the source parameter.
            this._transfer._readOsexpFile(this._source);
        } else {
            // Show error message.
            this.debugger.addError('No context parameter specified.');
        }
    }

    /** Build the experiment system. */
    _build() {
        // Create the experiment item. 
        this._experiment = new Experiment(this, this._name, this._script);
        this._experiment.from_string(this._script);
        if(this._onLog){
            this._experiment.onLog = this._onLog;
        }

        // Initialize the parameters class and request user input.
        this._parameters._initialize();
    }

    /** initialize the runner. */
    _initialize() {
        // Initialize the helper classes. 
        this._debugger._initialize();
        this._events._initialize();
        this._pythonParser._initialize();
        this._session._initialize();

        // Prepare and run the experiment item.
        this._experiment.prepare();
        this._experiment.run();
    }

    /** finalize the runner. */
    _finalize() {
        // Finalize the event system.
        this._events._finalize();

        // Finalize the debugger.
        this._debugger._finalize();

        // Clear the item store and file pool.
        this._itemStore.clean_up();
        this._pool.clean_up();

        // Exit the runner.
        this._exit();
    }

    /** Exit the experiment environment and execute the optional callback. */
    _exit() {
        // Leave the full screen mode 
        this._screen._fullScreenExit();

        // Reset te size of the container and the canvas.
        this._experiment._canvas._exitDisplay();

        // Clear the experiment item.
        this._experiment = null;

        // Check if a callback function is defined. 
        if (this._onfinished) {
            // Execute callback function.
            this._onfinished(this._data, this._session._session);
        }
    }

    /** Exit a running experiment. */
    exit() {
        // Set status of the event system to break.
        this._events._status = constants.TIMER_BREAK;
    }

    /**
     * Sets the pixel dimensions of the canvas. It does not change the actual
     * size of the canvas itself
     * @param {int} width  The target width
     * @param {int} height The target height
     * @return {void}
     */
    setPixelDimensions(width, height){
        // First check if height and width are passed and are numeric.
        // If not fall back to experiments width and height.
        // If that doesn't work, fall back to 1024x768 resolution.
        try{
            exp_width = parseInt(this._experiment.vars.width);
            exp_height = parseInt(this._experiment.vars.height);
        }catch(e){
            console.warn("Could not determine experiment dimensions: " + e.message);
            exp_width = 800;
            exp_height = 600;
        }

        width = parseInt(height) || exp_width;
        height = parseInt(height) || exp_height;

        try{
            this._renderer.resize(width, height);
        }catch(e) {
            this.debugger.addError('Could not resize renderer: ' + e.message);
        }
    }

    /**
     * Resizes the canvas using its style elements
     * DOES NOT WORK AS IT SHOULD YET!
     * @param  {int} width  The target width
     * @param  {int} height The target height
     * @return {void}
     */
    resizeCanvas(width, height){
        // First check if height and width are passed and are numeric.
        // If not fall back to experiments width and height.
        // If that doesn't work, fall back to 1024x768 resolution.
        try{
            exp_width = parseInt(this._experiment.vars.width);
            exp_height = parseInt(this._experiment.vars.height);
        }catch(e){
            console.warn("Could not determine experiment dimensions: " + e.message);
            exp_width = 800;
            exp_height = 600;
        } 
        
        width = parseInt(height) || exp_width;
        height = parseInt(height) || exp_height;

        try{
            this._renderer.view.style.width = xres;
            this._renderer.view.style.height = yres;
        }catch(e) {
            this.debugger.addError('Could not resize renderer: ' + e.message);
        }
    }

    /** Run an experiment */
    run(context) {
        // Build the experiment.
        this._setupContext(context);
    }
}