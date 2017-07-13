import Item from '../items/item.js';
import FormWidget from '../widgets/form.js';
import { constants } from '../system/constants.js';

/**
 * Class representing a base form class.
 * @extends Item
 */
export default class FormBase extends Item {
    /**
     * Create a base form item which is used as basic class for all form types.
     * @param {Object} experiment - The experiment item to which the item belongs.
     * @param {String} name - The unique name of the item.
     * @param {String} script - The script containing the properties of the item.
     * @param {String} itemType - The type of form to create.
     * @param {String} description - The description of the form plugin.
     */
    constructor(experiment, name, script, itemType, description) {
		// Inherited.
		super(experiment, name, script);

        // Define and set the public properties. 
        this.cols = [];
        this.description = 'A generic form plug-in';
        this.focus_widget = null;
        this.form = null;
        this.options = [];
        this.rows = [];
        this.timeout = null;
        
        // Set the class private properties.
        this._form_options = false;
        this._form_text = false;

        // Set the class public properties.
        this.description = description;
        this.item_type = itemType;

        // Process the script.
        this.from_string(script);
    }

    /** Implements the complete phase of an item. */
    _complete() {
        // PIXI: Set the cursor visibility to none (default).
        this.experiment._runner._renderer.view.style.cursor = 'none';

        // Set the timer to normal mode.
        this.experiment._runner._events._state = constants.TIMER_NONE;

        // form is finalized.
        this._status = constants.STATUS_FINALIZE;

        // Inherited.	
        super._complete();
    }

    _update(response) {
        // Update the rendering of the active form.
        this.form._canvas.show(this.form.experiment);        
    }

    /** Resets all item variables to their default value. */
    reset() {
        this.vars.cols = '2;2';
        this.vars.rows = '2;2';
        this.vars.spacing = 10;
        this.vars._theme = 'gray';
        this.vars.only_render = 'no';
        this.vars.timeout = 'infinite';
        this.vars.margins = '50;50;50;50';
        this._widgets = [];
    }

    parse_line(line) {
        // Split the line in tokens.
        var list = this.syntax.split(line);

        if ((this._form_text === true) && (list[0] !== '__end__')) {
            this.vars['form_text'] = this.vars['form_text'] + line.replace('\t', '') + ' <br/> ';
        }
        if ((this._form_options === true) && (list[0] !== '__end__')) {
            this.options.push(line.replace('\t',''));
        }

        // Check for widget definition.
        if (list[0] === 'widget') {
            // Remove widget command.
            list.shift();
      
            // Add widget to the list.
            this._widgets.push(list);
        } else if (list[0] === '__options__') {
            this._form_options = true;
        } else if (list[0] === '__form_text__') {
            this.vars['form_text'] = '';
            this._form_text = true;
        } else if (list[0] === '__end__') {
            this._form_options = false;
            this._form_text = false;
        }
    }

    /** Implements the prepare phase of an item. */
    prepare() {
        // Retrieve the column, rows and margins.
        var cols = (typeof this.vars.cols === 'string') ? this.vars.cols.split(';') : [String(this.vars.cols)];
        var rows = (typeof this.vars.rows === 'string') ? this.vars.rows.split(';') : [String(this.vars.rows)];
        var margins = this.vars.margins.split(';');

        // Get the time out parameter.
        if (this.vars.timeout === 'infinite') {
            var timeout = null;
        } else {
            var timeout = this.vars.timeout;
        }

        // Create the basic form.    
        this.form = new FormWidget(this.experiment, cols, rows, this.vars.spacing, 
            margins, this.vars._theme, this, timeout, this.vars.form_clicks === 'yes');

        // Parse the widget definitions.    
        for (var i = 0; i < this._widgets.length; i++) {
            this.focus_widget = null;
            var kwdict = {};
            var parameters = [];
            parameters.push(this.form);
            if (this._widgets[i].length > 5) {
                for (var j = 5; j < this._widgets[i].length; j++) {
                      var varName = String(this._widgets[i][j]).substr(0, String(this._widgets[i][j]).indexOf('='));
                    var varValue = String(this._widgets[i][j]).substring(String(this._widgets[i][j]).indexOf('=') + 1, String(this._widgets[i][j]).length);
                    kwdict[varName] = this.syntax.remove_quotes(varValue);
                    kwdict[varName] = this.syntax.eval_text(kwdict[varName], this.form.item.vars, true);
                    kwdict[varName] = this.syntax.remove_quotes(kwdict[varName])
                    parameters.push(this.syntax.remove_quotes(varValue));
                }
            }
        
            // Process focus keyword.
            var focus = false;
            if ((typeof kwdict['focus'] !== 'undefined') && (kwdict['focus'] === 'yes')) {
                delete(kwdict['focus']);
                focus = true;
            }    

            // Parse arguments
            var _type = this._widgets[i][4];
            var col = this._widgets[i][0];
            var row = this._widgets[i][1];
            var colspan = this._widgets[i][2];
            var rowspan = this._widgets[i][3];

            // Create the widget.
            try {
                var _w = this.experiment.items._newWidgetClass(_type, this.form, kwdict);
            } catch (e) {
                this.experiment._runner._debugger.addError('Failed to create widget ' + _type + ', error:' + e);
            }

            // Add the widget to the parent form.                    
            this.form.set_widget(_w, [col, row], colspan, rowspan);

            // Add as focus widget
            if (focus === true) {
                if (this.focus_widget != null) {
                    this.experiment._runner._debugger.addError('Osweb error: You can only specify one focus widget');
                } else {
                    this.focus_widget = _w;
                }
            }
        }

        // Inherited.   
        super.prepare();
    }

    /** Implements the run phase of an item. */
    run() {
        // Inherited.	
        super.run();

        // Execute the form.
        if (this.vars.only_render === 'yes') {
            // Render the form.
            this.form.render();

            // Continue the process.
            this._complete();

        } else {
            this.form._exec(this.focus_widget);
        }    
    }
}
 