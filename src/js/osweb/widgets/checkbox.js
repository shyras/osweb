import Widget from './widget.js';
import * as PIXI from 'pixi.js';
import { constants } from '../system/constants.js';
   
/** Class representing an OpenSesame text input Widget. */
export default class CheckBoxWidget extends Widget {
    /**
     * Create a widget object which represents a text label.
     * @param {Object} form - The form  which the widget belongs.
     * @param {Object} properties - The properties belonging to the widget.
     */
    constructor(form, properties) {
        // Inherited create.
        super(form);

        // Set the class public properties.
        this.checked = (typeof properties['checked'] !== 'undefined') ? (properties['checked'] === 'yes') : false;
        this.click_accepts = (typeof properties['click_accepts'] !== 'undefined') ? (properties['click_accepts'] === 'yes') : false;
        this.frame = (typeof properties['frame'] !== 'undefined') ? (properties['frame'] === 'yes') : false;
        this.group = (typeof properties['group'] !== 'undefined') ? properties['group'] : null;
        this.text = (typeof properties['text'] !== 'undefined') ? properties['text'] : '';
        this.var = (typeof properties['var'] !== 'undefined') ? properties['var'] : null;
        this.type = 'checkbox';
    
        // Set the class private properties.
        this._checkbox = null;
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
        text_element.x = 24;            
        text_element.y = 5;
        
        // PIXI: create the border box.
        var box_lines = new PIXI.Graphics();
        box_lines.lineStyle(1, 0x000000);
        box_lines.moveTo(1, 0);
        box_lines.lineTo(13, 0);
        box_lines.moveTo(14, 1);
        box_lines.lineTo(14, 13);
        box_lines.moveTo(0, 1);
        box_lines.lineTo(0, 13);
        box_lines.moveTo(1, 14);
        box_lines.lineTo(13, 14);
        box_lines.x = 5;
        box_lines.y = 7;
        
        // PIXI: create the fill box.
        var box_fill = new PIXI.Graphics();
        box_fill.lineStyle(1, 0xffffff, 1);
        box_fill.beginFill(0xffffff);
        box_fill.drawRect(1, 1, 12, 12);
        box_fill.endFill();
        box_fill.x = 5;
        box_fill.y = 7;
       
        // PIXI: create the check line.
        this._checkbox = new PIXI.Graphics();
        this._checkbox.lineStyle(1, 0x04b010);
        this._checkbox.moveTo(4,5);
        this._checkbox.lineTo(7,12);
        this._checkbox.lineTo(12,3);
        this._checkbox.x = 5;
        this._checkbox.y = 7;
        this._checkbox.visible = false;

        // Add the text_element to the container.
        this._container.addChild(box_lines);
        this._container.addChild(box_fill);
        this._container.addChild(this._checkbox);
        this._container.addChild(text_element);
    }    

    /** General drawing method for the label widget. */
    render() {
        // Set the interactive mode (if not set yet).
        if (this._container.interactive === false) {
            this._container.interactive = true;
            this._container.buttonMode = true;
            this._container.hitArea = new PIXI.Rectangle(0, 0, this._container._width, this._container._height);
            this._container.on("mousedown", function(event) { 
                this.response(event); 
            }.bind(this));
        }    

        // Clear the old content.
        this._container.removeChildren();

        // Draw the frame (if enabled).
        if (this.frame === true) {
            this.draw_frame();
        }

        // Update the text.
        var text = this.form.experiment.syntax.eval_text(this.text, null, false);

        // Draw the text.
        this.draw_text(text);
    
        // Set the toggle
        this.set_checked(this.checked);
    }

    /**
     * Set the status of the checkbox.
     * @param {Boolean} checked - Toggle to check or uncheck the checkbox.
     */
    set_checked(checked) {
        // Set the property.
        this.checked = checked;
    
        // PIXY: set the checkbox element.
        this._checkbox.visible = checked;
        
        // Rerender the form.
        this.form._canvas.show(this.form.experiment);

        // Adjust the widget.
        this.set_var(checked); 
    }

    /**
     * Process the response for the text input widget.
     * @param {Object} event - The response event.
     */
     response(event) {
        // Check if the checkbox is part of a group
        if (this.group !== null) {
            // Set group response.
            for (var i = 0;i < this.form.widgets.length;i++) {
                if ((this.form.widgets[i].type === 'checkbox') && (this.form.widgets[i] !== this) && (this.form.widgets[i].group === this.group)) {
                    this.form.widgets[i].set_checked(false);
                }
            } 
            
            // Set checkbox.    
            this.set_checked(true);
        }
        else {
            // Set single response.
            this.set_checked(!this.checked);
        } 

        // Complete the item element if accept_clicks is set to true.
        if (this.click_accepts === true) {
            if (this.form.timeout === null) {
                this.form.item._complete();
            } else {
                this.form.experiment._runner._events._currentItem._status = osweb.constants.STATUS_FINALIZE; 
            }    
        }
     }

    /**
     * Sets an experimental variable.
     * @param {Boolean|Number|String} pVal - The value for the variable.
     * @param {String} pVar - The name of the variabler to set.
     */
    set_var(pVal, pVar) {
        // set variable.
        var variable = (typeof pVar !== 'undefined') ? pVar : this.var;
        
        // Only set variable if it is defined.
        if (variable !== null) {
            var values = [];
            for (var i = 0;i < this.form.widgets.length;i++) {
                if ((this.form.widgets[i].type === 'checkbox') && (this.form.widgets[i].var === this.var) && (this.form.widgets[i].checked === true)) {
                    values.push(this.form.widgets[i].text);
                }
            }
            
            // Inherited.
            if (values === []) {
                super.set_var('no', variable);
            } else {
                super.set_var(values.join(';'), variable);
            }
        }     
    } 
}
 