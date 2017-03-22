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
        this.frame = (typeof properties['frame'] !== 'undefined') ? properties['frame'] === 'yes' : false;
        this.stub = (typeof properties['stub'] !== 'undefined') ? properties['stub'] : 'Type here...';
        this.text = (typeof properties['text'] !== 'undefined') ? properties['text'] : '';
        this.var = (typeof properties['var'] !== 'undefined') ? properties['var'] : null;
        this.return_accepts = (typeof properties['return_accepts'] !== 'undefined') ? properties['return_accepts'] === 'yes' : false;
        this.type = 'text_input';

        // Set the class private properties.
        this._text_input = new zebra.ui.TextField(this.text);
        this._text_input.x = 0;
        this._text_input.y = 0;
        
        // Add the button to the parent panel.
        this._panel.add(this._text_input);
        
        // Handle an button pressed event.
        this._text_input.keyPressed = function(event) {
            this.response(event);
        }.bind(this); 
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
        this._text_input.width = this._panel.width - 2; 
        this._text_input.height = this._panel.height - 2; 
 
        /* this._text_input.style.padding = Number(this.form.spacing) + 'px';
        this._text_input.style.fontStyle = this.form.experiment.vars.font_italic == 'yes' ? 'italic' : 'normal';
        this._text_input.style.fontWeight = this.form.experiment.vars.font_bold == 'yes' ? 'bold' : 'normal';
        this._text_input.style.fontFamily = this.form.experiment.vars.font_family;
        this._text_input.style.color = this.form.experiment.vars.foreground;
        this._text_input.style.fontSize = this.form.experiment.vars.font_size + 'px';
        this._text_input.style.textAlign = (this.center === true) ? 'center' : 'left';
        this._text_input.style.border = 'none';
        this._text_input.style.backgroundColor = this.form._themes.theme[this.form.theme].backgroundColor; */
    }

    /** General drawing method for the label widget. */
    render() {
        // Draw the frame (if enabled).
        if (this.frame === true) {
            this.draw_frame();
        }
    
        // Draw the text.
        this.draw_text(this.text);
    }
}
 