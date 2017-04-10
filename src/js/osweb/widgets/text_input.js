/**
 * Class representing an OpenSesame Image Widget. 
 * @extends Widget
 */
import Widget from './widget.js';
import { constants } from '../system/constants.js';

export default class TextInputWidget extends Widget {
    /**
     * Create a widget button object which represents a text input.
     * @param {Object} form - The form  which the widget belongs.
     * @param {Object} properties - The properties belonging to the widget.
     */
    constructor(form, properties) {
        // Inherited create.
        super(form);

        // Set the class public properties.
        this.center = (typeof properties['center'] !== 'undefined') ? (properties['center'] === 'yes') : false;
        this.frame = (typeof properties['frame'] !== 'undefined') ? (properties['frame'] === 'yes') : true;
        this.stub = (typeof properties['stub'] !== 'undefined') ? properties['stub'] : 'Type here...';
        this.text = (typeof properties['text'] !== 'undefined') ? properties['text'] : '';
        this.var = (typeof properties['var'] !== 'undefined') ? properties['var'] : null;
        this.return_accepts = (typeof properties['return_accepts'] !== 'undefined') ? (properties['return_accepts'] === 'yes') : false;
        this.type = 'text_input';
    }

    /**
     * Process the response for the text input widget.
     * @param {Object} event - The response event.
     */
    response(event) {
        // Only respond to enter key.
        if ((event.code === 13) && (this.return_accepts === true)) {
            // Set the variable.
            this.set_var(this._text_input.getValue(), this.var);

            // Complete the item element.
            if (this.form.timeout === null) {
                this.form.item._complete();
            } else {
                this.form.experiment._runner._events._currentItem._status = osweb.constants.STATUS_FINALIZE; 
            }    
        } 
    }

    /**
     * Draw the label widget.    
     * @param {Number|String} pText - The text for the labe.
     * @param {Number|String} pHtml - Toggle if the text contains html (ignored).
     */
    draw_text(text, html) {
        // PIXI - Create the text element  
        var text_style = {
            fontFamily: this.form.experiment.vars.font_family,
            fontSize: this.form.experiment.vars.font_size,
            fontStyle: (this.form.experiment.vars.font_italic === 'yes') ? 'italic' : 'normal',
            fontWeight: (this.form.experiment.vars.font_bold === 'yes') ? 'bold' : 'normal',
            fill: 0x000000
        };
        var inputField = new PixiTextInput(text, text_style);
   
         // Position the text element.
        if (this.center === true) {
            inputField.x = (this._container._width - inputField.width) / 2;  
            inputField.y = (this._container._height - inputField.height) / 2;  
        } else {
            inputField.x = 5;
            inputField.y = 5;
        }

        console.log(inputField);

        // Add the text_element to the container.
        this._container.interactive = true;
        this._container.addChild(inputField);
    }

    /** General drawing method for the label widget. */
    render() {
        // Clear the old content.
        this._container.removeChildren();

        // Draw the frame (if enabled).
        if (this.frame === true) {
            //this.draw_frame();
        }
    
        // Draw the text.
        this.draw_text(this.text);
    }
}
 