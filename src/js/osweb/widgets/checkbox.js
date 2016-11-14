
module.exports = function(osweb){
    "use strict";
    // Definition of the class checkbox.
    function checkbox(pForm, pProperties) {
        // Inherited create.
        this.widget_constructor(pForm);

        // Set the class public properties.
        this.checked = (typeof pProperties['checked'] !== 'undefined') ? pProperties['checked'] === 'yes' : this.checked;
        this.click_accepts = (typeof pProperties['click_accepts'] !== 'undefined') ? (pProperties['click_accepts'] === 'yes') : this.click_accepts;
        this.frame = (typeof pProperties['frame'] !== 'undefined') ? pProperties['frame'] === 'yes' : this.frame;
        this.group = (typeof pProperties['group'] !== 'undefined') ? pProperties['group'] : this.group;
        this.text = (typeof pProperties['text'] !== 'undefined') ? pProperties['text'] : this.text;
        this.var = (typeof pProperties['var'] !== 'undefined') ? pProperties['var'] : this.var;
        this.type = 'checkbox';

        // Create the html elements. 
        this.checkbox = document.createElement('input');
        this.checkbox.class = "css-checkbox";
        this.checkbox.type = "checkbox";
        this.checkbox.name = "name";
        this.checkbox.value = "value";
        this.checkbox.id = "id";
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
        this.set_checked(this.checked);
    };

    // Extend the class from its base class.
    var p = osweb.extendClass(checkbox, osweb.widget);

    // Definition of public properties. 
    p.checked = false;
    p.click_accepts = false;
    p.frame = false;
    p.group = null;
    p.text = '';
    p.var = null;

    // Definition of public class methods.
    
    p.response = function(event) {
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

    p.set_checked = function(pChecked) {
        // Set the property.
        this.checked = pChecked;
    
        // Set the checkbox html element.
        this.checkbox.checked = this.checked;
        
        // Adjust the widget.
        this.set_var(pChecked);
    };
    
    p.set_var = function(pVal, pVar) {
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
                this.widget_set_var('no', variable);
            } 
            else {
                this.widget_set_var(values.join(';'), variable);
            }
        }    
    }; 
    
    // Bind the checkbox class to the osweb namespace.
    return osweb.promoteClass(checkbox, "widget");
};