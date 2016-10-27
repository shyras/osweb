
module.exports = function(osweb){
    "use strict";
    // Definition of the class form_base.
    function form_base(pExperiment, pName, pScript, pItem_type, pDescription) {
        // Inherited.
        this.item_constructor(pExperiment, pName, pScript);

        // Set the class private properties.
        this._form_text = false;

        // Set the class public properties.
        this.description = pDescription;
        this.item_type = pItem_type;
    }

    // Extend the class from its base class.
    var p = osweb.extendClass(form_base, osweb.item);

    // Define and set the public properties. 
    p.cols = [];
    p.description = 'A generic form plug-in';
    p.focus_widget = null;
    p.form = null;
    p.rows = [];

    /*
     * Definition of public class methods - build cycle.
     */

    p.reset = function() {
        // Resets all item variables to their default value.
        this.vars.cols = '2;2';
        this.vars.rows = '2;2';
        this.vars.spacing = 10;
        this.vars._theme = 'gray';
        this.vars.only_render = 'no';
        this.vars.timeout = 'infinite';
        this.vars.margins = '50;50;50;50';
        this._variables = [];
        this._widgets = [];
    };

    p.parse_line = function(pString) {
        // Split the line in tokens.
        var list = this.syntax.split(pString);

        if ((this._form_text == true) && (list[0] != '__end__')) {
            this.vars['form_text'] = this.vars['form_text'] + pString.replace('\t', '');
        };

        // Check for widget definition.
        if (list[0] == 'widget') {
            // Remove widget command.
            list.shift();

            // Add widget to the list.
            this._widgets.push(list);
        } else if (list[0] == '__form_text__') {
            this.vars['form_text'] = '';
            this._form_text = true;
        } else if (list[0] == '__end__') {
            this._form_text = false;
        }

        /* if u'var' in kwdict:
	 self._variables.append(kwdict[u'var'])   */
    };

    /*
     * Definition of public class methods - run cycle.
     */

    p.prepare = function() {
        // Retrieve the column, rows and margins.
        var cols = (typeof this.vars.cols === 'string') ? this.vars.cols.split(';') : [String(this.vars.cols)];
        var rows = (typeof this.vars.rows === 'string') ? this.vars.rows.split(';') : [String(this.vars.rows)];
        var margins = this.vars.margins.split(';');

        // Get the time out paramter.
        if (this.vars.timeout == 'infinite') {
            var timeout = null;
        } else {
            var timeout = this.vars.timeout;
        }

        // Create the basic form.    
        this.form = new osweb.form(this.experiment, cols, rows, this.vars.spacing, 
            margins, this.vars._theme, this, timeout, this.vars.form_clicks == 'yes');

        for (var i = 0; i < this._widgets.length; i++) {
            this.focus_widget = null;
            var kwdict = {};
            var parameters = [];
            parameters.push(this.form);
            if (this._widgets[i].length > 5) {
                for (var j = 5; j < this._widgets[i].length; j++) {
                    var varName = String(this._widgets[i][j]).substr(0, String(this._widgets[i][j]).indexOf('='));
                    var varValue = String(this._widgets[i][j]).substring(String(this._widgets[i][j]).indexOf('=') + 1, String(this._widgets[i][j]).length);
                    kwdict[varName] = osweb.syntax.remove_quotes(varValue);
                    kwdict[varName] = osweb.syntax.eval_text(kwdict[varName], this.vars);
                    parameters.push(osweb.syntax.remove_quotes(varValue));
                }
            }

            console.log(kwdict);
    
            /* # Process focus keyword
            focus = False
            if u'focus' in kwdict:
                if kwdict[u'focus'] == u'yes':
                    focus = True
                del kwdict[u'focus'] */

            // Parse arguments
            var _type = this._widgets[i][4];
            var col = this._widgets[i][0];
            var row = this._widgets[i][1];
            var colspan = this._widgets[i][2];
            var rowspan = this._widgets[i][3];

            // Create the widget.
            try {
                var _w = osweb.newWidgetClass(_type, this.form, kwdict);
            } catch (e) {
                osweb.debug.addError('Failed to create widget ' + _type + ', error:' + e);
            }

            // Add the widget to the parent form.                    
            this.form.set_widget(_w, [col, row], colspan, rowspan);

            // Add as focus widget
            if (focus === true) {
                if (this.focus_widget != null) {
                    osweb.debug.addError('Osweb error: You can only specify one focus widget');
                } else {
                    this.focus_widget = _w;
                }
            }
        }

        // Inherited.   
        this.item_prepare();
    };

    p.run = function() {
        // Inherited.	
        this.item_run();

        // Execute the form.
        if (this.vars.only_render === 'yes') {
            this.form.render();
        }    
        else {
            this.form._exec(this.focus_widget);
        }    
    };

    p.complete = function() {
        // Hide the form
        this.form._parentform.style.display = 'none';
        this.form._form.style.display = 'none';
        osweb.runner._canvas.style.display = 'inline';

        // form is finalized.
        this._status = osweb.constants.STATUS_FINALIZE;

        // Inherited.	
        this.item_complete();
    };

    // Bind the form_base class to the osweb namespace.
    return osweb.promoteClass(form_base, "item");
};