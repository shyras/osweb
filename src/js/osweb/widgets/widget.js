import * as PIXI from 'pixi.js';

/** Class representing an OpenSesame Widget. */
export default class Widget {
    /**
     * Create a widget object which is the base class for all widgets.
     * @param {Object} form - The form  which the widget belongs.
     */
    constructor(form) {
        // Set the class public properties.
        this.focus = false;
        this.form = form;
        this.rect = null;
        this.type = 'widget';
        this.var = null;

        // Create the widget container. 
        this._container = new PIXI.Container(); // PIXI - Create the container which represents the canvas. 
    }    

    /**
     * Draw a frame around the widget.    
     * @param {Number|String} rect - The coordinates of the frame (ignored).
     * @param {Number|String} style - The style to use (ignored).
     */
    draw_frame(rect, style) {
        // Create the background line elements.
        var line = new PIXI.Graphics();
        line.lineStyle(1, this.form._canvas._styles._convertColorValue(this.form._themes.theme['gray'].lineColorLeftTop), 1);
        line.moveTo(this._container._width, 0);
        line.lineTo(0,0);
        line.lineTo(0,this._container._height);
        line.lineStyle(1, this.form._canvas._styles._convertColorValue(this.form._themes.theme['gray'].lineColorRightBottom), 1);
        line.lineTo(this._container._width, this._container._height);
        line.lineTo(this._container._width, 0);
        line.x = 0;
        line.y = 0;

        // Create the background color element.
        var rectangle = new PIXI.Graphics();
        rectangle.lineStyle(1, this.form._canvas._styles._convertColorValue(this.form._themes.theme['gray'].backgroundColor), 1);
        rectangle.beginFill(this.form._canvas._styles._convertColorValue(this.form._themes.theme['gray'].backgroundColor));
        rectangle.drawRect(1, 1, this._container._width - 2, this._container._height - 2);
        rectangle.endFill();
        rectangle.x = 0;
        rectangle.y = 0; 

        // Add the line element to container.
        this._container.addChild(rectangle);
        this._container.addChild(line);
    }

    /**
     * Sets an experimental variable.
     * @param {Boolean|Number|String} value - The value for the variable.
     * @param {String} variable - The name of the variabler to set.
     */
    set_var(value, variable) {
        // Sets an experimental variable.
        if (variable === null) {
            variable = this.var;
        }

        if (variable !== null) {
            this.form.experiment.vars.set(variable, value);
        }
    }
}
 