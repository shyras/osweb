
/*
 * Definition of the class label.
 */

(function() 
{
    function label(pForm, pProperties)
    {
	// Inherited create.
	this.widget_constructor(pForm);
	
        // Set the class private properties.
        this._element = document.createElement("SPAN");
        this._element.innerHTML = pProperties['text'];
        
        // Set the class public properties.
	this.center  = (typeof pProperties['center'] == 'boolean') ? pProperties['center'] : false; 
        this.frame   = (typeof pProperties['frame']  == 'boolean') ? pProperties['frame']  : false; 
        this.tab_str = '    ';
	this.type    = 'label';
	this.x_pad   = 8;
	this.y_pad   = 8;
    }; 
	
    // Extend the class from its base class.
    var p = osweb.extendClass(label, osweb.widget);

    // Definition of public properties. 
    p.center  = false;
    p.frame   = false;
    p.tab_str = '';
    p.text    = '';
    p.x_pad   = 0;
    p.y_pad   = 0;

    /*
     * Definition of public class methods - build cycle.
     */

    p.draw_text = function(pText, pHtml)
    {
        // Draws text inside the widget.
	pText = this.form.experiment.syntax.eval_text(pText);
	pText = safe_decode(pText).replace('\t', this.tab_str);

        if (this.center == true)
        {
            var x = this.rect.x + this.rect.w / 2;
            var y = this.rect.y + this.rect.h / 2;
        }  
        else
        {        
            var x = this.rect.x + this.x_pad;
            var y = this.rect.y + this.y_pad;
        }
        
        var w = this.rect.w - 2 * this.x_pad;
        
	this.form.canvas.text(pText, this.center, x, y, w, pHtml);
    };    

    p.render = function()
    {
	// Draws the widget.
        if (this.frame == true)
        {    
            this.draw_frame(this.rect);
        }
        
        this.draw_text(this.text); 
    };            
                
    // Bind the label class to the osweb namespace.
    osweb.label = osweb.promoteClass(label, "widget");
}());
