/** Class representing a Screen. */
osweb.screen = class Screen {
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
            this._introText2 = new PIXI.Text('web - version ' + osweb.OS_VERSION_NUMBER, {fontFamily: 'Arial', fontSize: 14, fill: '#FFFFFF'});
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
                    this._progressBarOuter.drawRect(202, 202,  Math.round(percentage * 396), 16);
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
}
 