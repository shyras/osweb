import Widget from './widget.js';
import * as PIXI from 'pixi.js';
import { constants } from '../system/constants.js';

/**
 * Class representing an OpenSesame label Widget. 
 * @extends LabelWidget
 */
export default class ButtonWidget extends Widget {
    /**
     * Create a widget button object which represents a push button.
     * @param {Object} form - The form  which the widget belongs.
     * @param {Object} properties - The properties belonging to the widget.
     */
    constructor(form, properties) {
        // Inherited create.
        super(form, properties);
    
        // Set the class public properties.
        this.center = (typeof properties['center'] !== 'undefined') ? (properties['center'] === 'yes') : true;
        this.frame = (typeof properties['frame'] !== 'undefined') ? (properties['frame'] === 'yes') : true;
        this.text = properties['text'];
        this.type = 'button';
        this.var = (typeof properties['var'] !== 'undefined') ? properties['var'] : this.var;

        // Set the current value of the variable to false (not pressed).
        this.set_var(false, this.var);  
    }

    /**
     * Draw the label widget.    
     * @param {Number|String} text - The text for the labe.
     * @param {Number|String} html - Toggle if the text contains html (ignored).
     */
    draw_text(text, html) {
        // PIXI - Create the text element  
        var text_style = {
            fontFamily: this.form._canvas._styles.font_family,
            fontSize: this.form.experiment.vars.font_size,
            fontStyle: (this.form.experiment.vars.font_italic === 'yes') ? 'italic' : 'normal',
            fontWeight: (this.form.experiment.vars.font_bold === 'yes') ? 'bold' : 'normal',
            fill: this.form.experiment.vars.foreground
        };
        var text_element = new PIXI.Text(text, text_style);
            
        // Position the text element.
        if (this.center === true) {
            text_element.x = (this._container._width - text_element.width) / 2;  
            text_element.y = (this._container._height - text_element.height) / 2;  
        } else {
            text_element.x = 5;
            text_element.y = 5;
        }
        
        // Add the text_element to the container.
        this._container.addChild(text_element);
    }    

    /** General drawing method for the label widget. */
    render() {
        // Set the interactive mode (if not set yet).
        if ((this.form.item.vars.only_render === 'no') && (this._container.interactive === false)) {
            this._container.interactive = true;
            this._container.buttonMode = true;
            this._container.hitArea = new PIXI.Rectangle(0, 0, this._container._width, this._container._height);
            this._container.on("mousedown", function(event) { this.response(event); }.bind(this));
        }    

        // Draw the frame (if enabled).
        if (this.frame === true) {
            this.draw_frame();
        }

        // Update the text.
        var text = this.form.experiment.syntax.eval_text(this.text, null, false);

        // Draw the text.
        this.draw_text(text);
    }

    /**
     * Process the response for the button widget.
     * @param {Object} event - The response event.
     */
    response(event) {
        // Set the attached variable.
        this.set_var(true, this.var);  

        // Complete the item element.
        if (this.form.timeout === null) {
            this.form.item._complete();
        } else {
            this.form.experiment._runner._events._currentItem._status = osweb.constants.STATUS_FINALIZE; 
        }    
    }
}
 