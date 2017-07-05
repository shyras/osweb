import ImageWidget from './image_widget.js';
import * as PIXI from 'pixi.js';
import { constants } from '../system/constants.js';

/**
 * Class representing an OpenSesame Image Button Widget. 
 * @extends ImageWidget
 */
export default class ImageButtonWidget extends ImageWidget {
    /**
     * Create a widget object which represents a text label.
     * @param {Object} form - The form  which the widget belongs.
     * @param {Object} properties - The properties belonging to the widget.
     */
    constructor(form, properties) {
        // Inherited create.
        super(form, properties);

        // Set the class public properties.
        this.type = 'image_button';
        this.var = (typeof properties['var'] !== 'undefined') ? properties['var'] : null;
    
        // Set the current status of the checkbox.
        this.set_var(false, this.var);  
    }

    /** General drawing method for the label widget. */
    render() {
        // Set the interactive mode (if not set yet).
        if ((this.form.item.vars.only_render === 'no') && (this._container.interactive === false)) {
            this._container.interactive = true;
            this._container.buttonMode = true;
            this._container.hitArea = new PIXI.Rectangle(0, 0, this._container._width, this._container._height);
            this._container.on("mousedown", function(event) { 
                this.response(event); 
            }.bind(this));
        }    

        // Inherited.
        super.render();
    }    

    /**
     * Process the response for the button widget.
     * @param {Object} event - The response event.
     */
    response(event) {
        // Set the current status of the checkbox.
        this.set_var(true, this.var);  
    
        // Complete the item element.
        if (this.form.timeout === null) {
            this.form.item._complete();
        } else {
            this.form.experiment._runner._events._currentItem._status = osweb.constants.STATUS_FINALIZE; 
        }    
    }
}
 