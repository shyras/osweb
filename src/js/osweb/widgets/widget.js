	/*
	 * Definition of the class widget.
	 */

	(function() {
	    function widget(pForm) {
	        // Set the class public properties.
	        this.focus = false;
	        this.form = pForm;
	        this.rect = null;
	        this.type = 'widget';
	        this.vars = null;
	    }

	    // Extend the class from its base class.
	    var p = widget.prototype;

	    // Definition of class public properties. 
	    p.form = null;
	    p.focus = false;
	    p.rect = null;
	    p.type = '';
	    p.vars = null;

	    /*
	     * Definition of public methods - general function.
	     */

	    p.box_size = function() {
	        return null;
	    };

	    p.theme_engine = function() {
	        return null;
	    };

	    p.draw_frame = function(pRect, pStyle) {};

	    p.on_mouse_click = function(pevent) {};

	    p.render = function() {};

	    p.set_rect = function(pRect) {};

	    p.set_var = function(pVal, pVar) {
	        // Sets an experimental variable.
	        if (pVar == null) {
	            pVar = this.vars;
	        }

	        if (pVar != null) {
	            this.form.experiment.vars.set(pVar, pVal);
	        }
	    };

	    // Bind the widget class to the osweb namespace.
	    osweb.widget = widget;
	}());