
module.exports = function(osweb){
    "use strict";
    // Definition of the class text_input.
    function text_input(pForm, pProperties) {
        // Inherited create.
        this.widget_constructor(pForm);

        // Set the class public properties.
        this.center = (typeof pProperties['center'] == 'boolean') ? pProperties['center'] : false;
        this.frame = (typeof pProperties['frame'] == 'boolean') ? pProperties['frame'] : false;
        this.text = pProperties['text'];
        this.type = 'text_input';

        // Set the class private properties.
        this._text_input = document.createElement("textarea");
        this._text_input.style.width = '100%';
        this._text_input.style.height = '100%';

        // Add the text_input to the element.
        this._element.appendChild(this._text_input);
        
        // Add event listener to the element.
        this._text_input.addEventListener("click", this.response.bind(this));
        this._text_input.addEventListener("keydown", this.response.bind(this));

    };

    // Extend the class from its base class.
    var p = osweb.extendClass(text_input, osweb.widget);

    // Definition of public properties. 
    p.center = false;
    p.frame = null;
    p.text = '';

    /*
     * Definition of public class methods - build cycle.
     */

    p.response = function(event) {
        console.log('text_input');
        console.log(event); 
// Complete the parent form.
        //this.form.item.complete();
    };

    p.draw_text = function(pText, pHtml) {
        this._element.style.textAlign = (this.center === true) ? 'center' : 'inherit';
        this._element.style.padding = Number(this.form.spacing) + 'px';
        this._element.style.fontStyle = this.form.experiment.vars.font_italic == 'yes' ? 'italic' : 'normal';
        this._element.style.fontWeight = this.form.experiment.vars.font_bold == 'yes' ? 'bold' : 'normal';
        this._element.style.fontFamily = this.form.experiment.vars.font_family;
        this._element.style.color = this.form.experiment.vars.foreground;
        this._element.style.fontSize = this.form.experiment.vars.font_size + 'px';
        this._element.style.lineHeight = this._element.style.height;
        this._text_input.style.backgroundColor = osweb.themes[this.form.theme].backgroundColor;
    };

    p.render = function() {
        // Draw the frame (if enabled).
        if (this.frame === true) {
            this.draw_frame();
        }
    
        // Draw the text.
        this.draw_text(this.text);
    };

    // Bind the text_input class to the osweb namespace.
    return osweb.promoteClass(text_input, "widget");
};