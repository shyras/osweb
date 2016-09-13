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

// Use strict mode.     
"use strict";

// Load prototype
// Do we still need prototype?
// var prototype = require('prototype');
// Object.extend(global, prototype);

// Check if we are running in a Node Js environment. If so, eliminate all
// items that call to document or window
var node_mode = false;
if(typeof(window) == "undefined"){
    node_mode = true;
}

// Create the osweb class and export it
var osweb = {};
module.exports = osweb;

//var createjs = require('createjs-combined');
//console.log(createjs);

// Definition of osweb version constants. 
osweb.VERSION_NAME = 'osweb';
osweb.VERSION_NUMBER = '3.0.045 (05-09-2016)';

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

// Definition of osweb class utility methods.
osweb.extendClass = function(sub_class, super_class) {
    function o() {
        this.constructor = sub_class;
    }
    o.prototype = super_class.prototype;
    return (sub_class.prototype = new o());
};

osweb.isClass = function(class_name) {
    // Return true if the classname is defined within the osweb namespace.
    return (this[class_name] !== undefined);
};

osweb.newItemClass = function(type, experiment, name, string) {
    // Create the element.
    var element = new this[type](experiment, name, string);

    // Set the type of the item.
    element.type = type;

    // Return the element
    return element;
};

osweb.newElementClass = function(type, sketchpad, string) {
    // Create the element.
    var element = new this[type](sketchpad, string);

    // Return the element
    return element;
};

osweb.newWidgetClass = function(type, form, variables) {
    // Create the element.
    var widget = new this[type](form, variables);

    // Return the element
    return widget;
};

osweb.promoteClass = function(sub_class, prefix) {
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

// If not running in node.js, bind osweb and alertify to global namespace
if(node_mode == false){
    // Make osweb globally available
    var alertify = require('alertifyjs');
    window.alertify = window.alertify || alertify;    
}

var filbert = require('filbert');

osweb.constants = require("./system/constants");
osweb.canvas = require("./backends/canvas");

osweb.clock = require('./backends/clock.js');
osweb.keyboard = require('./backends/keyboard.js'); 
osweb.log = require('./backends/log.js');
osweb.mouse = require('./backends/mouse.js'); 
osweb.sampler_backend = require('./backends/sampler.js');
osweb.video_backend = require('./backends/video.js');
// Classes
osweb.debug = require('./classes/debug.js');
osweb.pool = require('./classes/file_pool_store.js');
osweb.heartbeat = require('./classes/heartbeat.js');
osweb.item_stack = require('./classes/item_stack.js');
osweb.item_store = require('./classes/item_store.js');
osweb.python_workspace = require('./classes/python_workspace.js');
osweb.python_workspace_api = require('./classes/python_workspace_api.js');
osweb.response_info = require('./classes/response_info.js');
osweb.response_store = require('./classes/response_store.js');
osweb.syntax = require('./classes/syntax.js');
osweb.var_store = require('./classes/var_store.js');
osweb.Styles = require('./classes/styles.js');
// Items
osweb.item = require('./items/item.js');
osweb.generic_response = require('./items/generic_response.js')(osweb);
osweb.experiment = require('./items/experiment.js')(osweb);
osweb.inline_script = require('./items/inline_script.js')(osweb);
osweb.keyboard_response = require('./items/keyboard_response.js')(osweb);
osweb.logger = require('./items/logger.js')(osweb);
osweb.loop = require('./items/loop.js')(osweb);
osweb.mouse_response = require('./items/mouse_response.js')(osweb);
osweb.sampler = require('./items/sampler.js')(osweb);
osweb.sequence = require('./items/sequence.js')(osweb); 
osweb.sketchpad = require('./items/sketchpad.js')(osweb); 
osweb.feedback = require('./items/feedback.js')(osweb);
osweb.synth = require('./items/synth.js')(osweb);
// Plugins
osweb.advanced_delay = require('./plugins/advanced_delay.js')(osweb);
osweb.form_base = require('./plugins/form_base.js')(osweb);
osweb.form_consent = require('./plugins/form_consent.js')(osweb);
osweb.form_multiple_choice = require('./plugins/form_multiple_choice.js')(osweb);
osweb.form_text_display = require('./plugins/form_text_display.js')(osweb);
osweb.form_text_input = require('./plugins/form_text_input.js')(osweb);
osweb.form_text_render = require('./plugins/form_text_render.js')(osweb);
osweb.media_player_vlc = require('./plugins/media_player_vlc.js')(osweb);
osweb.notepad = require('./plugins/notepad.js')(osweb);
osweb.repeat_cycle = require('./plugins/repeat_cycle.js')(osweb);
osweb.reset_feedback = require('./plugins/reset_feedback.js')(osweb);
osweb.touch_response = require('./plugins/touch_response.js')(osweb);
// Elements
osweb.base_element = require('./elements/base_element.js');
osweb.arrow = require('./elements/arrow.js')(osweb);
osweb.circle = require('./elements/circle.js')(osweb);
osweb.ellipse = require('./elements/ellipse.js')(osweb);
osweb.fixdot = require('./elements/fixdot.js')(osweb);
osweb.gabor = require('./elements/gabor.js')(osweb);
osweb.image = require('./elements/image.js')(osweb);
osweb.line = require('./elements/line.js')(osweb);
osweb.noise = require('./elements/noise.js')(osweb);
osweb.rect = require('./elements/rect.js')(osweb);
osweb.textline = require('./elements/textline.js')(osweb);
// Widgets
osweb.form = require('./widgets/form.js');
osweb.widget = require('./widgets/widget.js');
osweb.button = require('./widgets/button.js')(osweb);
osweb.checkbox = require('./widgets/checkbox.js')(osweb);
osweb.label = require('./widgets/label.js')(osweb);

// Python modules.
osweb.python_math = require('./python/python_math.js')(osweb);
osweb.python_string = require('./python/python_string.js')(osweb);
osweb.python = require('./python/python.js')(osweb);

// Remaining system module
osweb.events = require('./system/events.js')(osweb);
osweb.functions = require('./system/functions.js'); 
osweb.parameters = require('./system/parameters.js');
osweb.prng = require('./system/prng.js');
osweb.screen = require('./system/screen.js');
osweb.session = require('./system/session.js');
osweb.transfer = require('./system/transfer.js');
osweb.runner = require('./system/runner.js')(osweb);
