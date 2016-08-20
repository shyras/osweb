/*
 * Definition of the class checkbox.
 */

module.exports = function(osweb){
    function checkbox(pForm, pProperties) {
        // Inherited create.
        this.widget_constructor(pForm);

        // Set the class private properties.
        this._element = document.createElement("LABEL");
        this._element_check = document.createElement("INPUT");
        this._element_check.setAttribute("type", "checkbox");
        this._element.style.width = '100%';
        this._element.style.height = '100%';
        this._element.textContent = pProperties['text'];

        //this._element.innerHTML        = pProperties['text'];
        this._element.style.fontStyle = this.form.experiment.vars.font_italic == 'yes' ? 'italic' : 'normal';
        this._element.style.fontWeight = this.form.experiment.vars.font_bold == 'yes' ? 'bold' : 'normal';
        this._element.style.fontFamily = this.form.experiment.vars.font_family;
        this._element.style.color = this.form.experiment.vars.foreground;
        this._element.style.fontSize = this.form.experiment.vars.font_size + 'px';
        this._element.appendChild(this._element_check);

        // Add event listener to the element.
        this._element.addEventListener("click", this.on_mouse_click.bind(this));

        console.log('---');
        console.log(pProperties);

        // Set the class public properties.
        this.click_accepts = (typeof pProperties.click_accepts === 'undefined') ? false : pProperties.click_accepts;
        this.group = (typeof pProperties.group === 'undefined') ? null : pProperties.group;
        this.type = 'checkbox';
        this.var = (typeof pProperties.var === 'undefined') ? null : pProperties.var;
        this.checked = (typeof pProperties.checked === 'checked') ? false : pProperties.checked;

        // Set the current status of the checkbox.
        this.set_var(this.checked);
    };

    // Extend the class from its base class.
    var p = osweb.extendClass(checkbox, osweb.widget);

    // Definition of public properties. 
    p.center = false;
    p.frame = null;
    p.tab_str = '';
    p.text = '';
    p.x_pad = 0;
    p.y_pad = 0;

    /*
     * Definition of public class methods.
     */

    p.on_mouse_click = function(event) {
        console.log('checkbox clicked');

    };

    // Bind the checkbox class to the osweb namespace.
    return osweb.promoteClass(checkbox, "widget");
}