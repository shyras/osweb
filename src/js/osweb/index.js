/*
 * OsWeb 
 *  
 * An experiment research tool written in Javascript (ES2016) and HTML to be  
 * used in Qualtrics or other web-based tools. Based upon OpenSesame.         
 *
 * Author: drs. J. Bos, D. Schreij & S. Mathot
 *
 * Copyright (c) University of Groningen 
 * Faculty of Behavioural and Social Sciences
 * Technical Support Service 
 *
 */

import { constants } from './system/constants.js'

// System
import Debugger from './system/debugger.js';
import Events from './system/events.js';
import Parameters from './system/parameters.js';
import Screen from './system/screen.js';
import Session from './system/session.js';
import Transfer from './system/transfer.js';
import Runner from './system/runner.js';

//Backends
import Canvas from './backends/canvas.js';
import Clock from './backends/clock.js';
import Keyboard from './backends/keyboard.js';
import Log from './backends/log.js';
import Mouse from './backends/mouse.js';
import Sampler from './backends/sampler.js';
import Video from './backends/video.js';

// Classes 
import FilePoolStore from './classes/file_pool_store.js';
import ItemStack from './classes/item_stack.js';
import ItemStore from './classes/item_store.js';
import PythonWorkspace from './classes/python_workspace.js';
import ResponseInfo from './classes/response_info.js';
import ResponseStore from './classes/response_store.js';
import Syntax from './classes/syntax.js';
import VarStore from './classes/var_store.js';

// Elements
import Arrow from './elements/arrow.js';
import Circle from './elements/circle.js';
import Ellipse from './elements/ellipse.js'
import Fixdot from './elements/fixdot.js';
import Gabor from './elements/gabor.js';
import ImageElement from './elements/image.js' // Image is an existing JS class.
import Line from './elements/line.js';
import Noise from './elements/noise.js';
import Rect from './elements/rect.js';
import Textline from './elements/textline.js';

// Items
import Item from './items/item.js';
import Experiment from './items/experiment.js';
import GenericResponse from './items/generic_response.js';
import KeyboardReponse from './items/keyboard_response.js';
import MouseResponse from './items/mouse_response.js';
import InlineScript from './items/inline_script.js';
import Logger from './items/logger.js';
import Loop from './items/loop.js';
import Sampler from './items/sampler.js';
import Sequence from './items/sequence.js';
import Sketchpad from './items/sketchpad.js';
import Feedback from './items/feedback.js';
import Synth from './items/synth.js';

// Plugins
import AdvancedDelay from './plugins/advanced_delay.js';
import MediaPlayer from './plugins/media_player_mpy.js';
import Notepad from './plugins/notepad.js';
import RepeatCycle from './plugins/repeat_cycle.js';
import ResetFeedback from './plugins/reset_feedback.js';
import TouchResponse from './plugins/touch_response.js'

// Python 
import PythonParser from './python/python.js';
import PythonMath from './python/python_math.js';
import PythonOpensesame from './python/python_opensesame.js';
import PythonRandom from './python/python_random.js';
import PythonString from './python/python_string.js'

// Create the osweb library container.
export default class Osweb{

	constructor(){
		// Definition of osweb version constants. 
		this.VERSION_NAME = 'OSWeb (ES2016)';
		this.VERSION_NUMBER = '3.0.051 (01-02-2017)';

    // System
    this.constants = constants;
    this.debugger = Debugger;
    this.events = Events;
    this.parameters = Parameters;
    this.screen = Screen;
    this.session = Session;
    this.transfer = Transfer
    this.runner = Runner;

		// Backends
    this.canvas = Canvas;
    this.clock = Clock;
    this.keyboard = Keyboard; 
    this.log = Log;
    this.mouse = Mouse;
    this.sampler = Sampler;
    this.video = Video;

    // Classes
    this.file_pool_store = FilePoolStore;
    this.item_stack = ItemStack;
    this.item_store = ItemStore;
    this.python_workspace = PythonWorkspace;
    this.response_info = ResponseInfo;
    this.response_store = ResponseStore;
    this.syntax = Syntax;
    this.var_store = VarStore;

    // Elements
    this.arrow = Arrow;
  	this.circle = Circle;
  	this.ellipse = Ellipse;
  	this.fixdot = Fixdot;
  	this.gabor = Gabor;
  	this.image = ImageElement;
  	this.line = Line;
  	this.noise = Noise;
  	this.rect = Rect;
  	this.textline = Textline;

    // Items
  	this.item = Item;
    this.experiment = Experiment;
    this.generic_response = GenericResponse;
    this.keyboard_response = KeyboardReponse;
    this.mouse_response = MouseResponse;
    this.inline_script = InlineScript;
    this.logger = Logger;
    this.loop = Loop;
    this.sampler = Sampler;
    this.sequence = Sequence;
    this.sketchpad = Sketchpad;
    this.feedback = Feedback;
    this.synth = Synth;

    // Plugins
    this.advanced_delay = AdvancedDelay;
    this.media_player_mpy = MediaPlayer;
    this.notepad = Notepad;
    this.repeat_cycle = RepeatCycle;
    this.reset_feedback = ResetFeedback;
    this.touch_response = TouchResponse;

    // Python
    this.python_parser = PythonParser;
    this.python_math = PythonMath;
    this.python_opensesame = PythonOpensesame;
    this.python_random = PythonRandom;
    this.python_string = PythonString;

    // Add replaceAll function to string prototype
    String.prototype.replaceAll = function(str1, str2, ignore) {
      return this.replace(
          new RegExp(
              str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),
              (ignore?"gi":"g")),
              (typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);
    } 

    // Add _pySlide function to string prototype (HACK for the filbert interpreter).
    String.prototype._pySlice = function(start, end, step) {
      if (end !== null) {
          return this.slice(start, end);
      } else {
          return this.slice(start);
      }    
    } 
	}

  print_version_info(){
    // Show library name and library version number in the console.
    console.log(this.VERSION_NAME + ' - ' + this.VERSION_NUMBER); 
  }
}

if (typeof window !== 'undefined') {
  window.alertify = require('alertifyjs');
  window.screenfull = require('screenfull');
  window.osweb = new Osweb();
  window.osweb.print_version_info();
}
