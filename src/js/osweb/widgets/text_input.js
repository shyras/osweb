
module.exports = function(osweb){
    "use strict";
    // Definition of the class text_input.
    function text_input(pForm, pProperties) {
        // Inherited create.
        this.widget_constructor(pForm);

        // Set the class public properties.
        this.center = (typeof pProperties['center'] !== 'undefined') ? (pProperties['center'] === 'yes') : false;
        this.frame = (typeof pProperties['frame'] !== 'undefined') ? pProperties['frame'] === 'yes' : false;
        this.stub = (typeof pProperties['stub'] !== 'undefined') ? pProperties['stub'] : 'Type here...';
        this.text = (typeof pProperties['text'] !== 'undefined') ? pProperties['text'] : '';
        this.var = (typeof pProperties['var'] !== 'undefined') ? pProperties['var'] : null;
        this.return_accepts = (typeof pProperties['return_accepts'] !== 'undefined') ? pProperties['return_accepts'] === 'yes' : false;
        this.type = 'text_input';

        // Set the class private properties.
        this._text_input = document.createElement("textarea");
        this._text_input.style.width = '100%';
        this._text_input.style.height = '100%';

        // Add the text_input to the element.
        this._element.appendChild(this._text_input);
        
        // Add event listener to the element.
        this._text_input.addEventListener("keydown", this.response.bind(this));
    };

    // Extend the class from its base class.
    var p = osweb.extendClass(text_input, osweb.widget);

    // Definition of public properties. 
    p.center = false;
    p.frame = false;
    p.return_accepts = false;
    p.stub = '';
    p.text = '';
    p.var = null;

    /*
     * Definition of public class methods - build cycle.
     */

    p.response = function(event) {
        // Stop event to go through. 
        event.stopPropagation();
        
        // Set the variable.
        this.set_var(this._text_input.value, this.var);
        
        // Only respond to enter key.
        if ((event.keyCode === 13) && (this.return_accepts === true)) {
            // Remove event listener from the element.
            this._text_input.removeEventListener("keydown", this.response.bind(this));

            // Complete the item element.
            if (this.form.timeout === null) {
                this.form.item.complete();
            } 
            else {
                osweb.events._current_item._status = osweb.constants.STATUS_FINALIZE; 
            }    
        } 
    };

    p.draw_text = function(pText, pHtml) {
        this._text_input.style.padding = Number(this.form.spacing) + 'px';
        this._text_input.style.fontStyle = this.form.experiment.vars.font_italic == 'yes' ? 'italic' : 'normal';
        this._text_input.style.fontWeight = this.form.experiment.vars.font_bold == 'yes' ? 'bold' : 'normal';
        this._text_input.style.fontFamily = this.form.experiment.vars.font_family;
        this._text_input.style.color = this.form.experiment.vars.foreground;
        this._text_input.style.fontSize = this.form.experiment.vars.font_size + 'px';
        this._text_input.style.textAlign = (this.center === true) ? 'center' : 'left';
        this._text_input.style.border = 'none';
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