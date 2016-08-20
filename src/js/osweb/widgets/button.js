/*
 * Definition of the class button.
 */

module.exports = function(osweb){
    function button(pForm, pProperties) {
        // Inherited create.
        this.widget_constructor(pForm);

        // Set the class private properties.
        this._element = document.createElement("BUTTON");
        this._element.style.width = '100%';
        this._element.style.height = '100%';
        this._element.textContent = pProperties['text'];
        this._element.style.fontStyle = this.form.experiment.vars.font_italic == 'yes' ? 'italic' : 'normal';
        this._element.style.fontWeight = this.form.experiment.vars.font_bold == 'yes' ? 'bold' : 'normal';
        this._element.style.fontFamily = this.form.experiment.vars.font_family;
        this._element.style.color = this.form.experiment.vars.foreground;
        this._element.style.fontSize = this.form.experiment.vars.font_size + 'px';

        // Add event listener to the element.
        this._element.addEventListener("click", this.response.bind(this));

        // Set the class public properties.
        this.center = (typeof pProperties['center'] == 'boolean') ? pProperties['center'] : false;
        this.frame = (typeof pProperties['frame'] == 'boolean') ? pProperties['frame'] : false;
        this.tab_str = '    ';
        this.type = 'button';
        this.x_pad = 8;
        this.y_pad = 8;
    };

    // Extend the class from its base class.
    var p = osweb.extendClass(button, osweb.widget);

    // Definition of public properties. 
    p.center = false;
    p.frame = null;
    p.tab_str = '';
    p.text = '';
    p.x_pad = 0;
    p.y_pad = 0;

    /*
     * Definition of public class methods - build cycle.
     */

    p.response = function(event) {
        console.log(this);
        // Complete the parent form.
        this.form.item.complete();
    };

    p.draw_text = function(pText, pHtml) {
        // Draws text inside the widget.
        pText = this.form.experiment.syntax.eval_text(pText);
        pText = safe_decode(pText).replace('\t', this.tab_str);

        if (this.center == true) {
            var x = this.rect.x + this.rect.w / 2;
            var y = this.rect.y + this.rect.h / 2;
        } else {
            var x = this.rect.x + this.x_pad;
            var y = this.rect.y + this.y_pad;
        }

        var w = this.rect.w - 2 * this.x_pad;

        this.form.canvas.text(pText, this.center, x, y, w, pHtml);
    };

    p.render = function() {
        // Draws the widget.
        if (this.frame == true) {
            this.draw_frame(this.rect);
        }

        this.draw_text(this.text);
    };

    // Bind the button class to the osweb namespace.
    return osweb.promoteClass(button, "widget");
}