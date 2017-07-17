import * as PIXI from 'pixi.js';
import Widget from './widget.js';
import Styles from '../backends/styles.js';

/**
 * Class representing an OpenSesame label Widget. 
 * @extends Widget
 */
export default class LabelWidget extends Widget {
    /**
     * Create a widget object which represents a text label.
     * @param {Object} form - The form  which the widget belongs.
     * @param {Object} properties - The properties belonging to the widget.
     */
    constructor(form, properties) {
        // Inherited create.
        super(form);

        // Set the class public properties.
        this.center = (typeof properties['center'] !== 'undefined') ? (properties['center'] === 'yes') : true;
        this.frame = (typeof properties['frame'] !== 'undefined') ? (properties['frame'] === 'yes') : false;
        this.text = properties['text'];
        this.type = 'label';
    }

    /**
     * Convert a text string to a collection of lines.    
     * @param {Number|String} text - The text to convert into lines.
     * @param {Number} width - The height of the containing box.
     * @param {Number} height - The width of the containing box.
     * @param {Object} text_style - The styling of the text.
     * @param {Array} - Array of text lines.
     */
    text_lines(text, width, height, text_style) {
        // Create a temporary canvas context.
        var canvas = document.createElement('canvas');
        canvas.width  = 800;
        canvas.height = 600;
        var buffer_context = canvas.getContext('2d');
        
        // Set the context font style. 
        buffer_context.font = text_style.fontSize + 'px ' + text_style.fontFamily;  
        if (text_style.fontWeight === 'bold') {
            buffer_context.font = 'bold ' + buffer_context.font;
        }    
        if (text_style.fontStyle === 'italic') {
            buffer_context.font = 'italic ' + buffer_context.font;
        }    
        
        // Create the lines of text 
        var words = text.split(' ');
        var lines = [];
        var line = '';
        var line_length = 0;
        while (words.length > 0) { 
            // Get the next word and the length of the word with one space.   
            var word = words.shift();
            var word_length = buffer_context.measureText(word + ' ').width; 
            if (word === '<br/>') {
                // line is done, add it to the lines.
                lines.push(line);
                // Set the new line.
                line = '';
                line_length = word_length;
            } else if ((line_length + word_length) > width) {
                // line is done, add it to the lines.
                lines.push(line);
                // Set the new line.
                line = word;
                line_length = word_length;
            } else {
                // Add the word to the line
                line = (line === '') ? word : line + ' ' + word;
                // increate the length of the line.
                line_length = line_length + word_length;     
            }
        }    
        
        // Check for remainder words.
        lines.push(line);

        // Return the lines.
        return lines;
    }    

    /**
     * Draw the label widget.    
     * @param {Number|String} text - The text for the label.
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
        // Get the lines and properties.
        var text_elements = this.text_lines(text, this._container._width - 10, this._container._height - 10, text_style);
        var lineProperties = this.form._canvas._getTextBaseline('MgyQ', text_style.fontFamily, text_style.fontSize, text_style.fontWeight);

        // Calculate the starting y position.
        var y = (this.center === true) ? (this._container._height - ((text_elements.length) * lineProperties.height)) / 2 : 5;      
        // Create the lines.
        for (var i = 0; i < text_elements.length; i++) {
            var text_element = new PIXI.Text(text_elements[i], text_style);
            text_element.x = Math.round((this.center === true) ? (this._container._width - text_element.width) / 2: 5);
            text_element.y = Math.round(y);
            y = y  + lineProperties.height;
            
            // Add the text_element to the container.
            this._container.addChild(text_element);
        }        
    }

    /** General drawing method for the label widget. */
    render() {
        // Clear the old content.
        this._container.removeChildren();
        
        // Draw the frame (if enabled).
        if (this.frame === true) {
            this.draw_frame();
        }

        // Update the text.
        var text = this.form.experiment.syntax.eval_text(this.text, this.form.item.vars, false);

        // Draw the text.
        this.draw_text(text);
    }
}
 