
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
    };

    // Extend the class from its base class.
    var p = osweb.extendClass(label, osweb.widget);

    // Definition of public properties. 
    p.center = true;
    p.frame = false;
    p.text = '';

    // Definition of public methods 

    p.draw_text = function(pText, pHtml) {
        // Set the special label properties.
        this._element.style.textAlign = (this.center === true) ? 'center' : 'inherit';
        // this._element.style.margin = Number(this.form.spacing) + 'px';
        this._element.style.fontStyle = this.form.experiment.vars.font_italic == 'yes' ? 'italic' : 'normal';
        this._element.style.fontWeight = this.form.experiment.vars.font_bold == 'yes' ? 'bold' : 'normal';
        this._element.style.fontFamily = this.form.experiment.vars.font_family;
        this._element.style.color = this.form.experiment.vars.foreground;
        this._element.style.fontSize = this.form.experiment.vars.font_size + 'px';
        this._element.style.lineHeight = this._element.style.height;
        
        // Set the text 
        this._element.innerHTML = pText;
    };

    p.render = function() {
        // Draw the frame (if enabled).
        if (this.frame === true) {
            this._element.style.backgroundColor = osweb.themes[this.form.theme].backgroundColor;
            //this._element.style.borderColor = "#babdb6 #555753 #555753 #babdb6";
            this._element.style.borderColor = osweb.themes[this.form.theme].lineColorLeftTop + ' ' + osweb.themes[this.form.theme].lineColorRightBottom + ' ' + 
               osweb.themes[this.form.theme].lineColorRightBottom + ' ' +osweb.themes[this.form.theme].lineColorLeftTop; 
            this._element.style.borderWidth = "1px";
            this._element.style.borderStyle = "solid";
        }

        // Draw the text.
        this.draw_text(this.text);
    };

    // Bind the label class to the osweb namespace.
    return osweb.promoteClass(label, "widget");
};