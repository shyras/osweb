
module.exports = function(osweb) {
    "use strict";
    // Definition of the class label.
    function label(pForm, pProperties) {
        // Inherited create.
        this.widget_constructor(pForm);

        // Set the class public properties.
        this.center = (typeof pProperties['center'] !== 'undefined') ? (pProperties['center'] === 'yes') : true;
        this.frame = (typeof pProperties['frame'] !== 'undefined') ? pProperties['frame'] === 'yes' : false;
        this.text = pProperties['text'];
        this.type = 'label';

        // Set the class private properties.
        this._label_table = document.createElement("div");
        this._label_table.style.display = 'table';
        this._label_table.style.width = '100%';
        this._label_table.style.height = '100%';
    
        this._label_cell = document.createElement("div");
        this._label_cell.style.display = 'table-cell';
        this._label_cell.style.width = '100%';
        this._label_cell.style.height = '100%';
        
        // Add the text_input to the element.
        this._element.appendChild(this._label_table);
        this._label_table.appendChild(this._label_cell);
    };

    // Extend the class from its base class.
    var p = osweb.extendClass(label, osweb.widget);

    // Definition of public properties. 
    p.center = true;
    p.frame = false;
    p.text = '';

    // Definition of public methods 

    p.draw_text = function(pText, pHtml) {
        // Set the text 
        this._label_cell.innerHTML = pText;

        // Set the special label properties.
        this._label_cell.style.fontStyle = this.form.experiment.vars.font_italic == 'yes' ? 'italic' : 'normal';
        this._label_cell.style.fontWeight = this.form.experiment.vars.font_bold == 'yes' ? 'bold' : 'normal';
        this._label_cell.style.fontFamily = this.form.experiment.vars.font_family;
        this._label_cell.style.color = this.form.experiment.vars.foreground;
        this._label_cell.style.fontSize = this.form.experiment.vars.font_size + 'px';
                
        // Set the horizontal and vertical alignment.
        if (this.center === true) {
            this._label_cell.style.textAlign = 'center';
            this._label_cell.style.verticalAlign = 'middle';
        } 
        else {
            this._label_cell.style.textAlign = 'left';
        }    
    };

    p.render = function() {
        // Draw the frame (if enabled).
        if (this.frame === true) {
            this.draw_frame();
        }

        // Update the text.
        var text = this.form.experiment.syntax.eval_text(this.text);

        // Draw the text.
        this.draw_text(this.text);
    };

    // Bind the label class to the osweb namespace.
    return osweb.promoteClass(label, "widget");
};