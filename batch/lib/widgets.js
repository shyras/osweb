	
/*
 * Definition of the class form.
 */

(function() 
{
    function form(pExperiment, pCols, pRows, pSpacing, pMargins, pTheme, pItem, pTimeout, pClicks)
    {
        // Set the class public properties.
        this.clicks     = pClicks;
	this.experiment = pExperiment;
	this.height     = this.experiment.vars.height;
	this.item       = (pItem != null) ? pItem : pExperiment;
	this.margins    = pMargins;
        this.spacing    = pSpacing;
	this.span       = [];
        this.timeout    = pTimeout;
	this.widgets    = []; 
        this.width      = this.experiment.vars.width;
        
        // Set the class public properties - columns and rows.
        var colSize = 0;
        for (var i=0;i < pCols.length;i++)
        {
            colSize = colSize + Number(pCols[i]);
        }
        this.cols = [];
        for (var i=0;i < pCols.length;i++)
        {
            this.cols.push(Math.round((pCols[i] / colSize) * 100));
        }    
        var rowSize = 0;
        for (var i=0;i < pRows.length;i++)
        {
            rowSize = rowSize + Number(pRows[i]);
        }
        this.rows = [];
        for (var i=0;i < pRows.length;i++)
        {
            this.rows.push(Math.round((pRows[i] / rowSize) * 100));
        }

        // Set the class private properties.
        this._parentform         = document.getElementById('osweb_form');
        this._form               = document.createElement("DIV");
        this._form.style.height  = '100%';
        this._form.style.width   = '100%';
        this._form.style.display = 'none';
        
        // Set the table properties and content.
        this._table                  = document.createElement("TABLE");
        this._table.style.padding    = this.margins[0] + 'px ' + this.margins[1] + 'px ' + this.margins[2] + 'px ' + this.margins[3] + 'px';
        this._table.style.height     = '100%';
        this._table.style.width      = '100%';
        this._table.style.fontStyle  = this.experiment.vars.font_italic == 'yes' ? 'italic' : 'normal'; 
        this._table.style.fontWeight = this.experiment.vars.font_bold   == 'yes' ? 'bold'   : 'normal'; 
        this._table.style.fontFamily = this.experiment.vars.font_family;
        this._table.style.color      = this.experiment.vars.foreground;
        this._table.style.fontSize   = this.experiment.vars.font_size + 'px';
        
        for (var i=0;i < this.rows.length;i++)
        {
            // Insert the row into the table.
            var row          = this._table.insertRow();
            row.style.height = this.rows[i] + '%';
            
            // Inser the cells.
            for (var j=0;j < this.cols.length;j++)
            {
                var cell = row.insertCell(j);
                cell.style.width   = this.cols[j] + '%';
                cell.style.padding = '5px';
            }    
        }        

        // Append the table to the form.
        this._parentform.appendChild(this._form);
        this._form.appendChild(this._table);
        
        // Dynamically load the theme object
	/* theme_mod = __import__(u'libopensesame.widgets.themes.%s' % theme, fromlist=[u'dummy'])
	theme_cls = getattr(theme_mod, theme)
	self.theme_engine = theme_cls(self) */
    } 
	
    // Extend the class from its base class.
    var p = form.prototype;

    // Definition of class public properties. 
    p.clicks     = null;
    p.experiment = null;
    p.height     = -1;
    p.item       = null;
    p.spacing    = null;
    p.timeout    = -1;
    p.width      = -1;
    
    /*
     * Definition of public methods - general function.
     */

    p._exec = function(pFocus_widget)
    {
    };   

    p.timed_out = function()
    {
    };

    p.cell_index = function(pPos)
    {
    };

    p.validate_geometry = function()
    {
    };

    p.get_cell = function(pIndex)
    {
    };
    
    p.get_rect = function(pIndex)
    {
    };

    p.render = function()
    {
	this.validate_geometry();
	this.canvas.clear();
	for (var widget in this.widgets)
	{
            if (widget !== null)
            {
                widget.render();
            }    
        }		
        
        this.canvas.show();
    };    

    p.set_widget = function(pWidget, pPos, pColspan, pRowspan)
    {
        // Get the row postition of the widget.
        var row  = this._table.rows[Number(pPos[1])];
        var cell = row.cells[Number(pPos[0])]; 
        if (Number(pColspan) > 1)
        {
            cell.colSpan = Number(pColspan);
        }
        if (Number(pRowspan) > 1)
        {
            cell.rowSpan = Number(pRowspan);
        }
        
        // Append widget to the cell.
        cell.appendChild(pWidget._element);
        
        /* var index = this.cell_index(nPos;)
	if (index >= len(this.widgets)
        {
            // raise osexception(u'Widget position (%s, %s) is outside of the form' % pos)
        }
        if type(colspan) != int or colspan < 1 or colspan > len(self.cols):
			raise osexception( \
				u'Column span %s is invalid (i.e. too large, too small, or not a number)' \
				% colspan)
		if type(rowspan) != int or rowspan < 1 or rowspan > len(self.rows):
			raise osexception( \
				u'Row span %s is invalid (i.e. too large, too small, or not a number)' \
				% rowspan) 
	this.widgets[index] = widget;
	this.span[index]    = colspan, rowspan
        this.widget.set_rect(this.get_rect(index)) */
    };

    p.xy_to_index = function(pXy)
    {
    };
  
    // Bind the form class to the osweb namespace.
    osweb.form = form;
}());
	
/*
 * Definition of the class widget.
 */

(function() 
{
    function widget(pForm)
    {
        // Set the class public properties.
	this.focus = false;
	this.form  = pForm;
	this.rect  = null;
	this.type  = 'widget';
	this.vars  = null;
    } 
	
    // Extend the class from its base class.
    var p = widget.prototype;

    // Definition of class public properties. 
    p.form  = null;
    p.focus = false;
    p.rect  = null;
    p.type  = '';	
    p.vars  = null;

    /*
     * Definition of public methods - general function.
     */

    p.box_size = function()
    {
        return null;
    };            

    p.theme_engine = function()
    {
        return null;
    };
    
    p.draw_frame = function(pRect, pStyle)
    {
    };    

    p.on_mouse_click = function(pevent)
    {
    };        

    p.render = function()
    {
    };

    p.set_rect = function(pRect)
    {
    };
    
    p.set_var = function(pVal, pVar)
    {
        // Sets an experimental variable.
        if (pVar == null)
        {
            pVar = this.vars;
        }    
	
        if (pVar != null)
        {
            this.form.experiment.vars.set(pVar, pVal);  
        }  
    };    
    
    // Bind the widget class to the osweb namespace.
    osweb.widget = widget;
}());

/*
 * Definition of the class button.
 */

(function() 
{
    function button(pForm, pProperties)
    {
	// Inherited create.
	this.widget_constructor(pForm);
	
        // Set the class private properties.
        this._element = document.createElement("BUTTON");
        this._element.style.width  = '100%';
        this._element.style.height = '100%';
        this._element.textContent = pProperties['text'];
        this._element.style.fontStyle  = this.form.experiment.vars.font_italic == 'yes' ? 'italic' : 'normal'; 
        this._element.style.fontWeight = this.form.experiment.vars.font_bold   == 'yes' ? 'bold'   : 'normal'; 
        this._element.style.fontFamily = this.form.experiment.vars.font_family;
        this._element.style.color      = this.form.experiment.vars.foreground;
        this._element.style.fontSize   = this.form.experiment.vars.font_size + 'px';

        // Add event listener to the element.
        this._element.addEventListener("click", this.response.bind(this));

        // Set the class public properties.
	this.center  = (typeof pProperties['center'] == 'boolean') ? pProperties['center'] : false; 
        this.frame   = (typeof pProperties['frame']  == 'boolean') ? pProperties['frame']  : false; 
        this.tab_str = '    ';
	this.type    = 'button';
	this.x_pad   = 8;
	this.y_pad   = 8;
    }; 
	
    // Extend the class from its base class.
    var p = osweb.extendClass(button, osweb.widget);

    // Definition of public properties. 
    p.center  = false;
    p.frame   = null;
    p.tab_str = '';
    p.text    = '';
    p.x_pad   = 0;
    p.y_pad   = 0;

    /*
     * Definition of public class methods - build cycle.
     */

    p.response = function(event)
    {
        console.log(this);
        // Complete the parent form.
        this.form.item.complete();
    };

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
                
    // Bind the button class to the osweb namespace.
    osweb.button = osweb.promoteClass(button, "widget");
}());

/*
 * Definition of the class checkbox.
 */

(function() 
{
    function checkbox(pForm, pProperties)
    {
	// Inherited create.
	this.widget_constructor(pForm);
	
        // Set the class private properties.
        this._element       = document.createElement("LABEL"); 
        this._element_check = document.createElement("INPUT");
        this._element_check.setAttribute("type", "checkbox");
        this._element.style.width      = '100%';
        this._element.style.height     = '100%';
        this._element.textContent        = pProperties['text'];
        
        //this._element.innerHTML        = pProperties['text'];
        this._element.style.fontStyle  = this.form.experiment.vars.font_italic == 'yes' ? 'italic' : 'normal'; 
        this._element.style.fontWeight = this.form.experiment.vars.font_bold   == 'yes' ? 'bold'   : 'normal'; 
        this._element.style.fontFamily = this.form.experiment.vars.font_family;
        this._element.style.color      = this.form.experiment.vars.foreground;
        this._element.style.fontSize   = this.form.experiment.vars.font_size + 'px';
        this._element.appendChild(this._element_check);

        // Add event listener to the element.
        this._element.addEventListener("click", this.on_mouse_click.bind(this));

        console.log('---');
        console.log(pProperties);

        // Set the class public properties.
	this.click_accepts = (typeof pProperties.click_accepts === 'undefined') ? false : pProperties.click_accepts;
	this.group         = (typeof pProperties.group === 'undefined') ? null : pProperties.group;
	this.type          = 'checkbox';
        this.var           = (typeof pProperties.var === 'undefined') ? null : pProperties.var;
        this.checked       = (typeof pProperties.checked === 'checked') ? false  : pProperties.checked;
        
        // Set the current status of the checkbox.
        this.set_var(this.checked);
    }; 
	
    // Extend the class from its base class.
    var p = osweb.extendClass(checkbox, osweb.widget);

    // Definition of public properties. 
    p.center  = false;
    p.frame   = null;
    p.tab_str = '';
    p.text    = '';
    p.x_pad   = 0;
    p.y_pad   = 0;

    /*
     * Definition of public class methods.
     */

    p.on_mouse_click = function(event)
    {
       console.log('checkbox clicked'); 
    
    };
                
    // Bind the checkbox class to the osweb namespace.
    osweb.checkbox = osweb.promoteClass(checkbox, "widget");
}());

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
