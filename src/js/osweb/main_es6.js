/*
 * osweb 
 *  
 * An experiment research tool written in Javascript and HTML to be used in 
 * Qualtrics or other web-based tools. Based upon OpenSesame.         
 *
 * Author: drs. J. Bos, D. Schreij & S. Mathot
 *
 * Copyright (c) University of Groningen 
 * Faculty of Behavioural and Social Sciences
 * Technical Support Service 
 *
 */


// Create the osweb class and export it
export default class osweb{

    constructor(canvasDOMElement, loggerFunction){
        this.canvas = canvasDOMElement;
        this.loggerFunction = loggerFunction;

        // Definition of osweb version constants. 
        this.VERSION_NAME = 'osweb';
        this.VERSION_NUMBER = '3.0.046 (17-01-2017)';
        // Show library name and library version number in the console.
        console.log(osweb.VERSION_NAME + ' - ' + osweb.VERSION_NUMBER);

        // Add replaceAll function to string prototype
        String.prototype.replaceAll = function(str1, str2, ignore){
            return this.replace(
                new RegExp(
                    str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),
                    (ignore?"gi":"g")),
                    (typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);
        }; 

        // Add _pySlide function to string prototype (HACK for the filbert interpreter).
        String.prototype._pySlice = function(start, end, step) {
            if (end !== null) {
                return this.slice(start, end);
            }
            else {
                return this.slice(start);
            }    
        };

        this.constants = require("./system/constants");

        // Backends
        this.canvas = require("./backends/canvas");
        this.clock = require('./backends/clock.js');
        this.keyboard = require('./backends/keyboard.js'); 
        this.log = require('./backends/log.js');
        this.mouse = require('./backends/mouse.js'); 
        this.sampler_backend = require('./backends/sampler.js');
        this.video_backend = require('./backends/video.js');
        // Classes
        this.debug = require('./classes/debug.js');
        this.pool = require('./classes/file_pool_store.js');
        this.heartbeat = require('./classes/heartbeat.js');
        this.item_stack = require('./classes/item_stack.js');
        this.item_store = require('./classes/item_store.js');
        this.python_workspace = require('./classes/python_workspace.js');
        this.response_info = require('./classes/response_info.js');
        this.response_store = require('./classes/response_store.js');
        this.syntax = require('./classes/syntax.js')(this);
        this.var_store = require('./classes/var_store.js');
        this.Styles = require('./classes/styles.js');
        // Items
        this.item = require('./items/item.js');
        this.generic_response = require('./items/generic_response.js')(this);
        this.experiment = require('./items/experiment.js')(this);
        this.inline_script = require('./items/inline_script.js')(this);
        this.keyboard_response = require('./items/keyboard_response.js')(this);
        this.logger = require('./items/logger.js')(this);
        this.loop = require('./items/loop.js')(this);
        this.mouse_response = require('./items/mouse_response.js')(this);
        this.sampler = require('./items/sampler.js')(this);
        this.sequence = require('./items/sequence.js')(this); 
        this.sketchpad = require('./items/sketchpad.js')(this); 
        this.feedback = require('./items/feedback.js')(this);
        this.synth = require('./items/synth.js')(this);

        // Plugins
        this.advanced_delay = require('./plugins/advanced_delay.js')(this);
        this.form_base = require('./plugins/form_base.js')(this);
        this.form_consent = require('./plugins/form_consent.js')(this);
        this.form_multiple_choice = require('./plugins/form_multiple_choice.js')(this);
        this.form_text_display = require('./plugins/form_text_display.js')(this);
        this.form_text_input = require('./plugins/form_text_input.js')(this);
        this.form_text_render = require('./plugins/form_text_render.js')(this);
        this.media_player_vlc = require('./plugins/media_player_vlc.js')(this);
        this.notepad = require('./plugins/notepad.js')(this);
        this.repeat_cycle = require('./plugins/repeat_cycle.js')(this);
        this.reset_feedback = require('./plugins/reset_feedback.js')(this);
        this.touch_response = require('./plugins/touch_response.js')(this);

        // Elements
        this.base_element = require('./elements/base_element.js');
        this.arrow = require('./elements/arrow.js')(this);
        this.circle = require('./elements/circle.js')(this);
        this.ellipse = require('./elements/ellipse.js')(this);
        this.fixdot = require('./elements/fixdot.js')(this);
        this.gabor = require('./elements/gabor.js')(this);
        this.image = require('./elements/image.js')(this);
        this.line = require('./elements/line.js')(this);
        this.noise = require('./elements/noise.js')(this);
        this.rect = require('./elements/rect.js')(this);
        this.textline = require('./elements/textline.js')(this);

        // Widgets
        this.form = require('./widgets/form.js');
        this.widget = require('./widgets/widget.js');
        this.themes = require('./widgets/themes.js')(this);
        this.checkbox = require('./widgets/checkbox.js')(this);
        this.image_widget = require('./widgets/image_widget.js')(this);
        this.image_button = require('./widgets/image_button.js')(this);
        this.label = require('./widgets/label.js')(this);
        this.button = require('./widgets/button.js')(this);
        this.text_input = require('./widgets/text_input.js')(this);

        // Python modules.
        this.python_math = require('./python/python_math.js')(this);
        this.python_opensesame = require('./python/python_opensesame.js')(this);
        this.python_random = require('./python/python_random.js')(this);
        this.python_string = require('./python/python_string.js')(this);
        this.python = require('./python/python.js')(this);

        // Remaining system module
        this.events = require('./system/events.js')(this);
        this.parameters = require('./system/parameters.js');
        this.prng = require('./system/prng.js');
        this.screen = require('./system/screen.js');
        this.session = require('./system/session.js');
        this.transfer = require('./system/transfer.js');
        this.runner = require('./system/runner.js')(this);
    } 

    // Definition of osweb class utility methods.
    /* Should be phased out! And ES6 extends functionality should be used */
    extendClass(sub_class, super_class){
        function o() {
            this.constructor = sub_class;
        }
        o.prototype = super_class.prototype;
        return (sub_class.prototype = new o());
    };

    isClass(class_name) {
        // Return true if the classname is defined within the osweb namespace.
        return (this[class_name] !== undefined);
    };

    newItemClass(type, experiment, name, string) {
        // Create the element.
        var element = new this[type](experiment, name, string);

        // Set the type of the item.
        element.type = type;

        // Return the element
        return element;
    };

    newElementClass(type, sketchpad, string) {
        // Create the element.
        var element = new this[type](sketchpad, string);

        // Return the element
        return element;
    };

    newWidgetClass(type, form, variables){
        // Hack for image elements.
        if (type === 'image') {
            type = type + '_widget';
        }

        // Create the element.
        var widget = new this[type](form, variables);

        // Return the element
        return widget;
    };

    promoteClass(sub_class, prefix){
        var subP = sub_class.prototype,
            supP = (Object.getPrototypeOf && Object.getPrototypeOf(subP)) || subP.__proto__;
        if (supP) {
            subP[(prefix += "_") + "constructor"] = supP.constructor;
            for (var n in supP) {
                if (subP.hasOwnProperty(n) && (typeof supP[n] === "function")) {
                    subP[prefix + n] = supP[n];
                }
            }
        }
        return sub_class;
    };

    setCanvas(canvasDOMElement){
        this.canvas = canvasDOMElement; 
    }

    setLoggerFunction(loggerFunction){
        this.loggerFunction = loggerFunction;
    }

    loadExperiment(experiment){
        this.experiment = experiment;
    }

    run(){
        this.runner.run(/* */);
    }
}
