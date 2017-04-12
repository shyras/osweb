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
        this.type = 'checkbox';
    
        // Set the class private properties.
        this._groupId = this.form._getGroupId(); 
        console.log(this._groupId);

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

            console.log('0');

        // Set the interactive mode.
        container.interactive = true;
        container.buttonMode = true;
        container.hitArea = new PIXI.Rectangle(0, 0, 15, 15);
        container.on("mousedown", function(event) { 
            console.log('1');
            this.response(event); 
        }.bind(this));
            console.log('2');
    }

    /** Draw a label element 
     * @param {Number} x - x position of the checkbox.
     * @param {Number} y - y position of the checkbox.
     * @param {String} text - the text for the label.
     */
    _drawText(x, y, text) {
        // PIXI - Create the text element  
        var text_style = {
            fontFamily: this.form.experiment.vars.font_family,
            fontSize: this.form.experiment.vars.font_size,
            fontStyle: (this.form.experiment.vars.font_italic === 'yes') ? 'italic' : 'normal',
            fontWeight: (this.form.experiment.vars.font_bold === 'yes') ? 'bold' : 'normal',
            fill: this.form.experiment.vars.foreground
        };
 
       // Get the lines and properties.
        var lineProperties = this.form._canvas._getTextBaseline(text, text_style.fontFamily, text_style.fontSize, text_style.fontWeight);
        var text_element = new PIXI.Text(text, text_style);
        text_element.x = x;
        text_element.y = y - lineProperties.height;

        // Add the text_element to the container.
        this._container.addChild(text_element);
    }

    /** General drawing method for the label widget. */
    render() {
        // Clear the old content.
        this._container.removeChildren();

        // Set the default positions.
        var cx = this._container._width / 2;
        var cy = this._container._height / 2;
        var _h = this.form._themes.theme['gray'].box_size;

        // Define horizontal or vertical positioning.
        if (this.orientation === 'horizontal') {
            // Create the rounding rectangle.
            var dx = (1 * this._container._width - 3 * _h) / (this._nodes.length - 1);
            // Draw the border
            this._drawBorder(0, cy - .5 *_h, this._container._width, 2 *_h);
            // create the label and checkbox widgets.
            var _x = _h; 
            for (var i = 0; i < this._nodes.length; i++) {
                // Create the checkbox widget  
                this._drawCheckBox(_x, cy);

                // Create the text label;
                this._drawText(_x, cy, this._nodes[i]);
               /* // Create the label widget  
                console.log(this._nodes[i]);
                var properties_lb = {text: this._nodes[i]};
                var widget_lb = this.form.experiment.items._newWidgetClass('label', this.form, properties_lb);
                var line_properties = this.form._canvas._getTextBaseline(this._nodes[i], text_style.fontFamily, text_style.fontSize, text_style.fontWeight);
                widget_lb._container.x = _x; 
                widget_lb._container.y = cy - line_properties.height;     
                this._container.addChild(widget_lb._container);
                widget_lb.render();
                console.log(widget_lb); */
               
                // Render the widget.
                _x = _x + dx;
            }

            // Add the elements to container.
        } else {

        }


        /* // Update the text.
        var text = this.form.experiment.syntax.eval_text(this.text);

        // Draw the text.
        this.draw_text(this.text);
    
        // Set the toggle
        this.set_checked(this.checked); */
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
         console.log(event);
         console.log(this);
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