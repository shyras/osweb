import { isNumber }  from 'underscore';
import Widget from './widget.js';
import * as PIXI from 'pixi.js';
import { constants } from '../system/constants.js';
   
/** Class representing an OpenSesame text input Widget. */
export default class RatingScaleWidget extends Widget {
    /**
     * Create a widget object which represents a text label.
     * @param {Object} form - The form  which the widget belongs.
     * @param {Object} properties - The properties belonging to the widget.
     */
    constructor(form, properties) {
        // Inherited create.
        super(form);

        // Set the class public properties.
        this.click_accepts = (typeof properties['click_accepts'] !== 'undefined') ? (properties['click_accepts'] === 'yes') : false;
        this.default = (typeof properties['default'] !== 'undefined') ? properties['default'] : null;
        this.orientation = (typeof properties['orientation'] !== 'undefined') ? properties['orientation'] : 'horizontal';
        this.nodes = (typeof properties['nodes'] !== 'undefined') ? properties['nodes'] : '5';
        this.var = (typeof properties['var'] !== 'undefined') ? properties['var'] : null;
        this.type = 'rating_scale';
    
        // Set the class private properties.
        this._checkBoxes = [];
        this._groupId = this.form._getGroupId(); 

        // Create a list of possible nodes.
        this._processNodes();
    }

    /** Create a list of checkbox nodes. */
    _processNodes() {
        // Process the nodes.
        this._nodes = [];

        // Check for a valid number.
        if (!isNaN(parseFloat(this.nodes)) && isFinite(this.nodes)) {
            // Create alist of empty nodes.
            for (var i = 0; i < Number(this.nodes); i++) {
                this._nodes.push('');
            } 
        } else {
            // Create a list of 
            var labels = this.nodes.split(';');
            for (var i = 0; i < labels.length; i++) {
                this._nodes.push(labels[i]);
            }
        }
    }

    /** Draw a border for the rating scale.
     * @param {Number} x - x position of the checkbox.
     * @param {Number} y - y position of the checkbox.
     * @param {Number} width - width of the border.
     * @param {Number} height - height of the border.
     */
    _drawBorder(x, y, width, height) {
        // Create the rectangle element.
        var rectangle = new PIXI.Graphics();
        rectangle.lineStyle(1, this.form._canvas._styles._convertColorValue(this.form._themes.theme['gray'].backgroundColor), 1);
        rectangle.drawRect(x, y, width, height);
        rectangle.x = 0;
        rectangle.y = 0; 
        
        // Add the rectangle to the container.
        this._container.addChild(rectangle);
    }

    /** Draw a checkbox element 
     * @param {Number} x - x position of the checkbox.
     * @param {Number} y - y position of the checkbox.
     */
    _drawCheckBox(x, y) {
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
        var box_check = new PIXI.Graphics();
        box_check.lineStyle(1, 0x04b010);
        box_check.moveTo(4,5);
        box_check.lineTo(7,12);
        box_check.lineTo(12,3);
        box_check.x = 5;
        box_check.y = 7;
        box_check.visible = false;

        // Add the elements to a container. 
        var container = new PIXI.Container(); 
        container.addChild(box_lines);
        container.addChild(box_fill);
        container.addChild(box_check);
        container.x = x;
        container.y = y;

        // Add the wisget to the container.
        this._container.addChild(container);
        this._checkBoxes.push(container);    

        // Set the interactive mode.
        container.interactive = true;
        container.buttonMode = true;
        container.hitArea = new PIXI.Rectangle(0, 5, 15, 15);
        container.on("mousedown", function(event) { 
            this.response(event); 
        }.bind(this));
    }

    /** Draw a label element 
     * @param {Number} x - x position of the checkbox.
     * @param {Number} y - y position of the checkbox.
     * @param {String} text - the text for the label.
     * @param {Boolean} horizotal - if true horizontal otherwise vertical.
     */
    _drawText(x, y, text, horizontal) {
        // PIXI - Create the text element  
        var text_style = {
            fontFamily: this.form._canvas._styles.font_family,
            fontSize: this.form.experiment.vars.font_size,
            fontStyle: (this.form.experiment.vars.font_italic === 'yes') ? 'italic' : 'normal',
            fontWeight: (this.form.experiment.vars.font_bold === 'yes') ? 'bold' : 'normal',
            fill: this.form.experiment.vars.foreground
        };
 
       // Get the lines and properties.
        var lineProperties = this.form._canvas._getTextBaseline(text, text_style.fontFamily, text_style.fontSize, text_style.fontWeight);
        var text_element = new PIXI.Text(text, text_style);
        if (horizontal === true) {
            text_element.x = x - (text_element.width / 2) + 15;
            text_element.y = y - lineProperties.height;
        } else {
            text_element.x = x - text_element.width - 15;
            text_element.y = y + 2;
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
        }    

        // Clear the old content.
        this._checkBoxes = [];
        this._container.removeChildren();

        // Set the default positions.
        var cx = this._container._width / 2;
        var cy = this._container._height / 2;
        var _h = this.form._themes.theme['gray'].box_size;

        // Define horizontal or vertical positioning.
        if (this.orientation === 'horizontal') {
            // Calculate the distances between the checkboxes.
            var dx = (1 * this._container._width - 3 * _h) / (this._nodes.length - 1);

            // Create the rounding rectangle.
            this._drawBorder(0, cy - .5 *_h, this._container._width, 2 *_h);

            // create the label and checkbox widgets.
            var _x = _h; 
            for (var i = 0; i < this._nodes.length; i++) {
                // Create the checkbox widget  
                this._drawCheckBox(_x, cy - 5);

                // Update the text.
                var text = this.form.experiment.syntax.eval_text(this._nodes[i], null, false);

                // Create the text label;
                this._drawText(_x, cy - 8, this._nodes[i], true);
               
                // Increase the position.
                _x = _x + dx;
            }
        } else {
            // Calculate the distances between the checkboxes.
            var dy = (1 * this._container._height - 3 * _h) / (this._nodes.length - 1); 

            // Create the rounding rectangle.
            this._drawBorder(cx - .5 *_h, 0, 2 * _h, this._container._height);

            // create the label and checkbox widgets.
            var _y = _h; 
            for (var i = 0; i < this._nodes.length; i++) {
                // Create the checkbox widget  
                this._drawCheckBox(cx - 5, _y);

                // Update the text.
                var text = this.form.experiment.syntax.eval_text(this._nodes[i], null, false);

                // Create the text label;
                this._drawText(cx - 8, _y, this._nodes[i], false);
               
                // Increase the position.
                _y = _y + dy;
            }
        }    
        
        // Enable the default checkbox. 
        if (this.default !== null) {
            // Enable the checkbox.
            this._checkBoxes[Number(this.default)].children[2].visible = true;
   
            // Set the value
            this.set_value(Number(this.default));
        }
    }

    /**
     * Process the response for the text input widget.
     * @param {Object} event - The response event.
     */
     response(event) {
        // Parse trough the boxes.
        for (var i = 0;i < this._checkBoxes.length; i++) {
            if (this._checkBoxes[i] === event.currentTarget) {
                // Enable the checkbox.
                this._checkBoxes[i].children[2].visible = true;
                
                // Set the value for the rating scale.
                this.set_value(i);
            } else {
                // Disable the checkbox.
                this._checkBoxes[i].children[2].visible = false;
            }
        }
    }

    /**
     * Sets the rating scale value.
     * @param {Number} value - The value for the rating scale.
     */
    set_value(value) {
        // Chekc for a valid value
        if ((value === null) && ((value < 0) || (value > this._nodes.length))) {
            this.form.experiment._runner._debugger.addError('Trying to select a non-existing node. Did you specify an incorrect default value?');
        } else {
            // Set the value property.
            this.value = value;

            // Set te variable.
            this.set_var(value);
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
 