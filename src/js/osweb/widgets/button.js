/**
 * Class representing an OpenSesame label Widget. 
 * @extends LabelWidget
 */
import Widget from './widget.js';
import { constants } from '../system/constants.js';

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
        this.type = 'button';
        this.var = (typeof properties['var'] !== 'undefined') ? properties['var'] : this.var;

        // Set the class private properties.
        this._button = new zebra.ui.Button("Test");
        this._button.x = 0;
        this._button.y = 0;
        
        // Add the button to the parent panel.
        this._panel.add(this._button);
        
        // Handle an button pressed event.
        this._button.bind(function(event) {
            this.response(event);
        }.bind(this));         
    
        // Set the current status of the checkbox.
        this.set_var(false, this.var);  
    }

    /**
     * Draw the label widget.    
     * @param {Number|String} text - The text for the labe.
     * @param {Number|String} html - Toggle if the text contains html (ignored).
     */
    draw_text(text, html) {
        this._button.width = this._panel.width - 2; 
        this._button.height = this._panel.height - 2; 
    }    

    /** General drawing method for the label widget. */
    render() {
        // Draw the frame (if enabled).
        if (this.frame === true) {
            this.draw_frame();
        }

        // Update the text.
        //var text = this.form.experiment.syntax.eval_text(this.text);

        // Draw the text.
        this.draw_text('this.text');
    }

    /**
     * Process the response for the button widget.
     * @param {Object} event - The response event.
     */
    response(event) {
        console.log('button');
        console.log(this);
        // Remove event listener from the element.
        // this._label_cell.removeEventListener("click", this.response.bind(this));

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

 