/**
 * Class representing an OpenSesame label Widget. 
 * @extends Widget
 */
import Widget from './widget.js';

export default class LabelWidget extends Widget {
    /**
     * Create a widget button object which represents a text label.
     * @param {Object} form - The form  which the widget belongs.
     * @param {Object} properties - The properties belonging to the widget.
     */
    constructor(form, properties) {
        // Inherited create.
        super(form);

        // Set the class public properties.
        this.center = (typeof properties['center'] !== 'undefined') ? (properties['center'] === 'yes') : this.center;
        this.frame = (typeof properties['frame'] !== 'undefined') ? properties['frame'] === 'yes' : this.frame;
        this.text = properties['text'];
        this.type = 'label';

        // Set the class private properties.
        this._label = new zebra.ui.Label(new zebra.data.Text(this.text));
     
        // Add the button to the parent panel.
        this._panel.add(this._label);
    }

    /**
     * Draw the label widget.    
     * @param {Number|String} text - The text for the labe.
     * @param {Number|String} html - Toggle if the text contains html (ignored).
     */
    draw_text(text, html) {
        //
        var textRender = new zebra.ui.TextRender(text);
        console.log(textRender);
        
        // Set the text 
        this._label.setValue(text);

        console.log(this._label.height);
        console.log(this._label.width);

        // Adjust the label dimension.
        this._label.width = this._panel.width - 2; 
        this._label.height = this._panel.height - 2; 

        // Set the special label properties.
        var fontStyle =  new zebra.ui.Font(this.form.experiment.vars.font_family, '', Number(this.form.experiment.vars.font_size));
        this._label.setFont(fontStyle);
        this._label.setColor(this.form.experiment.vars.foreground);
       
        // Set the horizontal and vertical alignment.
        /* if (this.center === true) {
            this._label_cell.style.textAlign = 'center';
            this._label_cell.style.verticalAlign = 'middle';
        } else {
            this._label_cell.style.textAlign = 'left';
        }  */   
    }

    /** General drawing method for the label widget. */
    render() {
        // Draw the frame (if enabled).
        if (this.frame === true) {
            this.draw_frame();
        }

        // Update the text.
        var text = this.form.experiment.syntax.eval_text(this.text);

        // Draw the text.
        this.draw_text(this.text);
    }
}
 