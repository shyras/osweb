import { VERSION_NUMBER } from '../index.js';
import { isFunction } from 'underscore';
import { constants } from '../system/constants.js';

/** Class representing a Screen. */
export default class Screen {
    /**
     * Create an introduction screen which handles the start of the experiment.
     * @param {Object} runner - The runner class to which the screen belongs.
     */
    constructor(runner) {
        // Set class parameter properties.
        this._runner = runner; // Parent runner attached to the screen object.    

        // Set class properties.
        this._active = true; // If true the introduction screen is shown.
        this._click = true; // If true all is started with a mouse click.
        this._container = null; // PIXI: Container which holds the screen info. 
        this._exit = false; // Exit toggle to prevent dialog when closing experiment.
    }   

    /** Initialize the fullscreen mode if enabled. */
    _fullScreenInit() {
        // Check if fullscreen must be enabled.
        if (this._runner._fullScreen === true) {
            // Get the container element.
            var element = this._runner._container;

            // Go full-screen
            if (element.requestFullscreen) {
	            document.addEventListener("fullscreenchange", function(e) { this._fullScreenChanged(e)}.bind(this));
                document.addEventListener("fullscreenerror", function(e) { this._fullScreenError(e)}.bind(this));
                element.requestFullscreen();
            } else if (element.webkitRequestFullscreen) {
                document.addEventListener("webkitfullscreenchange", function(e) { this._fullScreenChanged(e)}.bind(this));
                document.addEventListener("webkitfullscreenerror", function(e) { this._fullScreenError(e)}.bind(this));
	            element.webkitRequestFullscreen();
            } else if (element.mozRequestFullScreen) {
                document.addEventListener("mozfullscreenchange", function(e) { this._fullScreenChanged(e)}.bind(this));
                document.addEventListener("mozfullscreenerror",function(e) { this._fullScreenError(e)}.bind(this));
            	element.mozRequestFullScreen();
            } else if (element.msRequestFullscreen) {
        	    document.addEventListener("MSFullscreenChange", function(e) { this._fullScreenChanged(e)}.bind(this));
                document.addEventListener("MSFullscreenError", function(e) { this._fullScreenError(e)}.bind(this));
                element.msRequestFullscreen();
            }
        }
    }    

    /** Finalize the fullscreen mode if if was enabled. */
    _fullScreenExit() {
        // Check if fullscreen must be enabled.
        if (this._runner._fullScreen === true) {
            // Set the exit toggle.
            this._exit = true;
      
            // Exit the full screen mode.
            if (document.exitFullscreen) {
	            document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
    	        document.webkitExitFullscreen();
            } else if (document.mozCancelFullScreen) {
    	        document.mozCancelFullScreen();
            } else if (document.msExitFullscreen) {
    	        document.msExitFullscreen();
            }
        }
    }    

    /** Event handler which responds to full-screen change. */
    _fullScreenChanged() {
        // Check if we are dropping out of full-screen.
        if (document.fullscreenElement ||
	        document.webkitFullscreenElement ||
	        document.mozFullScreenElement ||
	        document.msFullscreenElement) {
            // Scale the canvas
            switch (this._runner._scaleMode) {
                case 'noScale': 
                    // Default mode, no scaling, canbas is centered on the screen. 
                    this._runner._renderer.view.style.top = '0px'; 
                    this._runner._renderer.view.style.bottom = '0px'; 
                    this._runner._renderer.view.style.left = '0px'; 
                    this._runner._renderer.view.style.right = '0px'; 
                    this._runner._renderer.view.style.right = '0px'; 
                    this._runner._renderer.view.style.margin = 'auto';    
                    this._runner._renderer.view.style.display = 'block';    
                    this._runner._renderer.view.style.position = 'absolute'; 
                    this._runner._renderer.render(this._runner._experiment._currentCanvas._container);
                break;
                case 'showAll':
                    // Default mode, no scaling, canbas is centered on the screen. 
                    this._runner._renderer.view.style.top = '0px'; 
                    this._runner._renderer.view.style.bottom = '0px'; 
                    this._runner._renderer.view.style.left = '0px'; 
                    this._runner._renderer.view.style.right = '0px'; 
                    this._runner._renderer.view.style.right = '0px'; 
                    this._runner._renderer.view.style.margin = 'auto';    
                    this._runner._renderer.view.style.display = 'block';    
                    this._runner._renderer.view.style.position = 'absolute'; 
                    if ((this._runner._container.clientWidth - this._runner._experiment.vars.width) >  
                       (this._runner._container.clientHeight - this._runner._experiment.vars.height)) {
                         var ar = (this._runner._container.clientHeight / this._runner._experiment.vars.height);
                         this._runner._renderer.resize(Math.round(this._runner._experiment.vars.width * ar), this._runner._container.clientHeight)
                         this._runner._experiment._scale_x = Math.round(this._runner._experiment.vars.width * ar) / this._runner._experiment.vars.width; 
                         this._runner._experiment._scale_y = (this._runner._container.clientHeight / this._runner._experiment.vars.height);                                
                       } else {
                         var ar = (this._runner._container.clientWidth / this._runner._experiment.vars.width);
                         this._runner._renderer.resize(this._runner._container.clientWidth, Math.round(this._runner._experiment.vars.height * ar));
                         this._runner._experiment._scale_x = (this._runner._container.clientWidth / this._runner._experiment.vars.width);                                
                         this._runner._experiment._scale_y = Math.round(this._runner._experiment.vars.height * ar) / this._runner._experiment.vars.height; 
                       }
                    this._runner._experiment._currentCanvas._container.scale.x = this._runner._experiment._scale_x;
                    this._runner._experiment._currentCanvas._container.scale.y = this._runner._experiment._scale_y;                                
                    this._runner._renderer.render(this._runner._experiment._currentCanvas._container);
                break;        
                case 'exactFit':
                    // Fit to the exact window size (cropping).       
                    this._runner._experiment._scale_x = (this._runner._container.clientWidth / this._runner._experiment.vars.width);
                    this._runner._experiment._scale_y = (this._runner._container.clientHeight / this._runner._experiment.vars.height);
       
                    // Reize the current canvas.
                    this._runner._renderer.resize(this._runner._container.clientWidth, this._runner._container.clientHeight);
                    this._runner._experiment._currentCanvas._container.scale.x = this._runner._experiment._scale_x;
                    this._runner._experiment._currentCanvas._container.scale.y = this._runner._experiment._scale_y;
                    this._runner._renderer.render(this._runner._experiment._currentCanvas._container);
                break;        
            }
        } else {
            // Check for exiting experiment.
            if (this._exit === false) {
                // Resclae to 1Fit to the exact window size (cropping).       
                this._runner._experiment._scale_x = 1;
                this._runner._experiment._scale_y = 1;

                // Fit to the exact window size (cropping).       
                this._runner._renderer.resize(this._runner._experiment.vars.width, this._runner._experiment.vars.height);
                this._runner._experiment._currentCanvas._container.scale.x = 1;
                this._runner._experiment._currentCanvas._container.scale.y = 1;
                this._runner._renderer.render(this._runner._experiment._currentCanvas._container);

                // Open Sesame is running, request subject to continue of to stop.
                if (isFunction(this._runner._confirm)) {
                    this._runner._confirm('Leaving full-screen mode, pausing experiment.', 
                        'Please press ok the resume the experiment otherwise cancel to stop.', 
                        this._onFullScreenConfirm.bind(this), this._onFullScreenCancel.bind(this) );
                }
            }
        }     
    }    

    /** Event handler which responds to full-screen change errors. */
    _fullScreenError() {
        // Show error message.
        this._runner.debugger.addError('Could not start full-screen mode, experiment stopped.');
    }    

    /** Event handler to respond to dialog ok conmfirmation. */
     _onFullScreenConfirm() {
        // Get the container element.
        var element = this._runner._container;
        // Go full-screen
        if (element.requestFullscreen) {
	        element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        } else if (element.mozRequestFullScreen) {
          	element.mozRequestFullScreen();
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
    }

    /** Event handler to respond to dialog cancel confirmation. */
    _onFullScreenCancel() {
        // Exit the experiment.
        this._runner._finalize();
    }

    /** Set the introscreen elements. */
    _setupIntroScreen() {
        // Check if introscreen is used.
        if (this._active === true) {
            // Define introscreen elements.
            this._introScreen = new PIXI.Container();
            this._introLine = new PIXI.Graphics();
            this._introLine.lineStyle(1,0xAAAAAA,1);
            this._introLine.moveTo(0, 0);
            this._introLine.lineTo(400, 0);
            this._introLine.x = 200;
            this._introLine.y = 159;
            this._introScreen.addChild(this._introLine);  
            this._introText1 = new PIXI.Text('Os', {fontFamily: 'Times', fontSize: 24, fill: '#FF0000'});
            this._introText1.position.set(200, 135);
            this._introScreen.addChild(this._introText1)
            this._introText2 = new PIXI.Text('web - version ' + VERSION_NUMBER, {fontFamily: 'Arial', fontSize: 14, fill: '#FFFFFF'});
            this._introText2.position.set(231, 142);
            this._introScreen.addChild(this._introText2)
            this._introText3 = new PIXI.Text('', {fontFamily: 'Arial', fontSize: 12, fill: '#FFFFFF'});
            this._introText3.position.set(200, 163);
            this._introScreen.addChild(this._introText3)

            // Show the introduction screen.
            this._runner._renderer.render(this._introScreen);    
        }
    }

    /** Check if the experiment must be clicked to start. */
    _setupClickScreen() {
        // Check if the experiment must be clicked to start.
        if (this._click === true) {
            // Update inroscreen.
            this._updateIntroScreen('Press with the mouse on this screen to continue.');

            // Setup the mouse click response handler.
            var clickHandler = function(event) {
                // Remove the handler.
                this._runner._renderer.view.removeEventListener('click', clickHandler);

                // Finalize the introscreen elements.
                this._clearIntroScreen();

                // Start the task.
                this._runner._initialize();
            }.bind(this);

            // Set the temporary mouse click.
            this._runner._renderer.view.addEventListener('click', clickHandler, false);
        } else {
            // Finalize the introscreen elements.
            this._clearIntroScreen();
 
            // Start the runner.
            this._runner._initialize();
        }
    }

    /** Clear the introscreen elements. */
    _clearIntroScreen() {
        // Update the introscreen elements.
        if (this._active === true) {
            // Clear the stage by temoving al the child elements.
            for (var i = this._introScreen.children.length - 1; i >= 0; i--) {	
                this._introScreen.removeChild(this._introScreen.children[i]);
            };
            this._runner._renderer.render(this._introScreen);    
        }
    }

    /**
     * Updates the progress bar used when loading the file pool.
     * @param {Number} percentage - The percentage (0-100) of the progress bar.
     */
    _updateProgressBar(percentage)
    {
        if (this._active === true) {
            // Select the stage.
            switch (percentage)
            {
                case -1: 
                    this._progressBarOuter = new PIXI.Graphics();
                    this._progressBarOuter.lineStyle(1,0xFFFFFF, 1);
                    this._progressBarOuter.drawRect(200, 200, 400, 20);
                    this._progressBarOuter.x = 0;
                    this._progressBarOuter.y = 0;
                    this._progressBarInner = new PIXI.Graphics();
                    this._progressBarInner.lineStyle(1,0xFFFFFF, 1);
                    this._progressBarInner.drawRect(202, 202, 1, 16);
                    this._progressBarInner.x = 0;
                    this._progressBarInner.y = 0;
                    this._introScreen.addChild(this._progressBarInner)
                    this._introScreen.addChild(this._progressBarOuter)
                    this._runner._renderer.render(this._introScreen);    
                break;
                case 100:
                    this._introScreen.removeChild(this._progressBarInner)
                    this._introScreen.removeChild(this._progressBarOuter)
                    this._runner._renderer.render(this._introScreen);    
                break;
                default:
                    this._progressBarOuter.beginFill(0xFFFFFF);
                    this._progressBarOuter.drawRect(202, 202, Math.round(percentage * 396), 16);
                    this._progressBarOuter.endFill();
                    this._runner._renderer.render(this._introScreen);    
            }        
        }    
    }

    /**
     * Update the introscreen elements.
     * @param {String} text - The text which must be updated.
     */
    _updateIntroScreen(text) {
        // Update the introscreen elements.
        if (this._active === true) {
            this._introText3.text = text;
            this._runner._renderer.render(this._introScreen);    
        }
    }

    /** Show the pause screen. */
    _showPauseScreen() {
        // Open Sesame is running, request subject to continue of to stop.
        if (isFunction(this._runner._confirm)) {
            this._runner._confirm('Esc key pressed, pausing experiment.', 
                'Please press ok the resume the experiment otherwise cancel to stop.', 
                this._onPauseScreenConfirm.bind(this), this._onPauseScreenCancel.bind(this));
        }
    }    
  
    /** Event handler to respond to dialog ok conmfirmation. */
    _onPauseScreenConfirm() {
        // Restore the old state.
        this._runner._events._state = this._runner._events._statePrevious;
    }

    /** Event handler to respond to dialog cancel confirmation. */
    _onPauseScreenCancel() {
        // Exit the experiment.
        this._runner._finalize();
    }
}
 