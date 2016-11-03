
module.exports = function(osweb){
    "use strict";
    // Definition of the class checkbox.
    function checkbox(pForm, pProperties) {
        // Inherited create.
        this.widget_constructor(pForm);

        // Set the class public properties.
        this.checked = (typeof pProperties['checked'] !== 'undefined') ? pProperties['checked'] === 'yes' : false;
        this.click_accepts = (typeof pProperties['click_accepts'] !== 'undefined') ? (pProperties['click_accepts'] === 'yes') : false;
        this.frame = (typeof pProperties['frame'] !== 'undefined') ? pProperties['frame'] === 'yes' : false;
        this.group = (typeof pProperties['group'] !== 'undefined') ? pProperties['group'] : null;
        this.text = (typeof pProperties['text'] !== 'undefined') ? pProperties['text'] : '';
        this.var = (typeof pProperties['var'] !== 'undefined') ? pProperties['var'] : null;
        this.type = 'checkbox';

        // Create the html elements. 
        this.checkbox = document.createElement('input');
        this.checkbox.class = "css-checkbox";
        this.checkbox.type = "checkbox";
        this.checkbox.name = "name";
        this.checkbox.value = "value";
        this.checkbox.id = "id";
        this.checkbox.checked = this.checked;
        this.label = document.createElement('label');
        this.label.class = "css-label";
        this.label.htmlFor = "id";
        this.label.appendChild(document.createTextNode(this.text));

        // Add the elements to the container.
        this._element.appendChild(this.checkbox);
        this._element.appendChild(this.label);

        // Add event listener to the element.
        this.checkbox.addEventListener("click", this.response.bind(this));
 
        // Set the current status of the checkbox.
        this.set_var(this.checked, this.var);  
    };

    // Extend the class from its base class.
    var p = osweb.extendClass(checkbox, osweb.widget);

    // Definition of public properties. 
    p.checked = false;
    p.frame = null;
    p.group = null;
    p.text = '';
    p.var = null;

    // Definition of public class methods.
    
    p.response = function(event) {
        // Set the checked toggle.
        this.checked = this.checkbox.checked;
        
        // Set the correspoding var.
        this.set_var(this.checked, this.var);  
    };

    p.draw_text = function(pText, pHtml) {
        // Set the text 
        this.label.innerHTML = pText;
    
        // Set the special label properties.
        this.label.style.fontStyle = this.form.experiment.vars.font_italic == 'yes' ? 'italic' : 'normal';
        this.label.style.fontWeight = this.form.experiment.vars.font_bold == 'yes' ? 'bold' : 'normal';
        this.label.style.fontFamily = this.form.experiment.vars.font_family;
        this.label.style.color = this.form.experiment.vars.foreground;
        this.label.style.fontSize = this.form.experiment.vars.font_size + 'px';
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

    // Bind the checkbox class to the osweb namespace.
    return osweb.promoteClass(checkbox, "widget");
};