"use strict";
// Definition of the class screen - startup screen.
function screen() {
    throw 'The class screen cannot be instantiated!';
}

// Definition of private properties.
screen._container = null;     // EASELJS: Container which holds the shapes. 
screen._active    = true;     // If true the introduction screen is shown.
screen._click     = true;     // If true the experiment is started with a mouse click.

/** Set the introscreen elements. */
screen._setupIntroScreen = function() {
    // Set the introscreen elements.
    if (this._active === true) {
        this._introScreen = new PIXI.Container();
        this._introLine = new PIXI.Graphics();
        this._introLine.lineStyle(1,0xAAAAAA,1);
        this._introLine.moveTo(0, 0);
        this._introLine.lineTo(400, 0);
        this._introLine.x = 200;
        this._introLine.y = 159;
        this._introScreen.addChild(this._introLine);  
        this._introText1 = new PIXI.Text('OS', {fontFamily: 'Times', fontSize: 24, fill: '#FF0000'});
        this._introText1.position.set(200, 135);
        this._introScreen.addChild(this._introText1)
        this._introText2 = new PIXI.Text(osweb.constants.MESSAGE_002 + osweb.VERSION_NUMBER, {fontFamily: "Arial", fontSize: 14, fill: "#FFFFFF"});
        this._introText2.position.set(231, 142);
        this._introScreen.addChild(this._introText2)
        this._introText3 = new PIXI.Text('', {fontFamily: "Arial", fontSize: 12, fill: "#FFFFFF"});
        this._introText3.position.set(200, 163);
        this._introScreen.addChild(this._introText3)
        // Show the introduction screen.
        osweb.runner._renderer.render(this._introScreen);    
    }
};

/** Check if the experiment must be clicked to start. */
screen._setupClickScreen = function() {
    // Check if the experiment must be clicked to start.
    if (this._click === true) {
        // Update inroscreen.
        this._updateIntroScreen(osweb.constants.MESSAGE_006);

        // Setup the mouse click response handler.
        var clickHandler = function(event) {
            // Remove the handler.
            osweb.runner._renderer.view.removeEventListener("click", clickHandler);

            // Finalize the introscreen elements.
            this._clearIntroScreen();

            // Start the task.
            osweb.runner._initialize();
        }.bind(this);

        // Set the temporary mouse click.
        osweb.runner._renderer.view.addEventListener('click', clickHandler, false);
    } else {
        // Finalize the introscreen elements.
        this._clearIntroScreen();

        // Start the runner.
        osweb.runner._initialize();
    }
};

/** Clear the introscreen elements. */
screen._clearIntroScreen = function() {
    // Update the introscreen elements.
    if (this._active === true) {
        // Clear the stage by temoving al the child elements.
        for (var i = this._introScreen.children.length - 1; i >= 0; i--) {	
            this._introScreen.removeChild(this._introScreen.children[i]);
        };
        osweb.runner._renderer.render(this._introScreen);    
    }
};

/**
 * Updates the progress bar used when loading the file pool.
 * @param {Number} percentage - The progress percentage (0-100) of the progress bar.
 */
screen._updateProgressBar = function(percentage)
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
                osweb.runner._renderer.render(this._introScreen);    
            break;
            case 100:
                this._introScreen.removeChild(this._progressBarInner)
                this._introScreen.removeChild(this._progressBarOuter)
                osweb.runner._renderer.render(this._introScreen);    
            break;
            default:
                this._progressBarOuter.beginFill(0xFFFFFF);
                this._progressBarOuter.drawRect(202, 202,  Math.round(percentage * 396), 16);
                this._progressBarOuter.endFill();
                osweb.runner._renderer.render(this._introScreen);    
        }        
    }    
};

/**
 * Update the introscreen elements.
 * @param {String} text - The text which must be updated.
 */
screen._updateIntroScreen = function(text) {
    // Update the introscreen elements.
    if (this._active === true) {
        this._introText3.text = text;
        osweb.runner._renderer.render(this._introScreen);    
    }
};

// Bind the screen class to the osweb namespace.
module.exports = screen;