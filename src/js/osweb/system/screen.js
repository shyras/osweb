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
        this._introScreen = new createjs.Shape();
        this._introScreen.graphics.beginFill('#000000').drawRect(0, 0, osweb.runner._stage.width, osweb.runner._stage.height);
        this._introLine = new createjs.Shape();
        this._introLine.graphics.beginFill('#AAAAAA').drawRect(200, 155, 400, 1);
        this._introText1 = new createjs.Text('OS', "24px bold Times", "#FF0000");
        this._introText1.x = 200;
        this._introText1.y = 135;
        this._introText2 = new createjs.Text(osweb.constants.MESSAGE_002 + osweb.VERSION_NUMBER, "14px Arial", "#FFFFFF");
        this._introText2.x = 231;
        this._introText2.y = 142;
        this._introText3 = new createjs.Text('', "12px Arial", "#FFFFFF");
        this._introText3.x = 200;
        this._introText3.y = 168;
        osweb.runner._stage.addChild(this._introScreen, this._introLine, this._introText1, this._introText2, this._introText3);
        osweb.runner._stage.update();
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
            osweb.runner._canvas.removeEventListener("click", clickHandler);

            // Finalize the introscreen elements.
            this._clearIntroScreen();

            // Start the task.
            osweb.runner._initialize();
        }.bind(this);

        // Set the temporary mouse click.
        osweb.runner._canvas.addEventListener("click", clickHandler, false);
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
        osweb.runner._stage.removeAllChildren();
        osweb.runner._stage.update();
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
                this._progressBarOuter = new createjs.Shape();
                this._progressBarOuter.graphics.setStrokeStyle(1).beginStroke("#ffffff").drawRect(200, 200, 400, 20);
                this._progressBarInner = new createjs.Shape();
                osweb.runner._stage.addChild(this._progressBarOuter,this._progressBarInner);
                osweb.runner._stage.update();
            break;
            case 100:
                osweb.runner._stage.removeChild(this._progressBarOuter,this._progressBarInner);
                osweb.runner._stage.update();
            break;
            default:
                this._progressBarInner.graphics.beginFill('#ffffff').drawRect(202, 202, Math.round(percentage * 396), 16);
                osweb.runner._stage.update();
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
        osweb.runner._stage.update();
    }
};

// Bind the screen class to the osweb namespace.
module.exports = screen;