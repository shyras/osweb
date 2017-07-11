import Canvas from '../backends/canvas.js';
import Themes from './themes.js';
import { constants } from '../system/constants.js';

/** Class representing an Form widget for showing widgets. */
export default class FormWidget {
    /**
     * Create a form widget object used to show widget elements to the subject.
     * @param {Object} experiment - The experiment item to which the form belongs.
     * @param {String} cols - The unique name of the item.
     * @param {String} rows - The unique name of the item.
     * @param {String} spacing - The script containing the properties of the item.
     * @param {String} margins - The script containing the properties of the item.
     * @param {String} theme - The script containing the properties of the item.
     * @param {Object} item - The item to which the form belongs.
     * @param {String} timeout - The script containing the properties of the item.
     * @param {String} clicks - The script containing the properties of the item.
     */
    constructor(experiment, cols, rows, spacing, margins, theme, item, timeout, clicks) {
        // Set the class public properties.
        this.clicks = clicks;
        this.cols = cols;
        this.experiment = experiment;
        this.height = this.experiment.vars.height;
        this.item = (item !== null) ? item : experiment;
        this.margins = margins;
        this.rows = rows;
        this.spacing = spacing;
        this.span = [];
        this.theme = theme;
        this.timeout = timeout;
        this.widgets = [];
        this.width = this.experiment.vars.width;

        // Calculate the total number ot rows and columns.
        this.colNr = 0;
        for (var i = 0; i < cols.length; i++) {
            this.colNr = this.colNr + Number(cols[i]);
        }
        this.rowNr = 0;
        for (var i = 0; i < rows.length; i++) {
            this.rowNr = this.rowNr + Number(rows[i]);
        }

        // Set the class private properties.
        this._groupId = 0;

        // Create the form canvas. 
        this._canvas = new Canvas(this.experiment, false);
        this._canvas._styles.background_color = experiment.vars.background;

        // Set the form dimensions.
        this._canvas._container.height = experiment.vars.height; 
        this._canvas._container.width = experiment.vars.width;
        this._canvas._styles.font_family = experiment.vars.font_family;

        // Create the themes object.
        this._themes = new Themes();
    }

    /** Create a unique group id for muliple rating scale groups. */  
    _getGroupId() {
        // Return a unique group id and increase it.
        return this._groupId++;
    } 

    /**
     * Execute and render the form.
     * @param {Object} pFocus_widget - The widget which receives focus (optional).
     */
    _exec(focus_widget) {
        // Render the form.
        this.render();

        // Enabled the focus widget.
        if (focus_widget !== null) {
            // Focus the text_input widget.
            focus_widget.setFocus();
        }
    
        // Set the timer to form pause.
        this.experiment._runner._events._state = constants.TIMER_FORM;

        // PIXI: Set the cursor visibility to none (default).
        this.experiment._runner._renderer.view.style.cursor = 'default';

        // Set the onset time.
        this.item.set_item_onset();

        // Set the duration parameter.
        if ((this.timeout !== null) && (this.item !== null)) {
            this.item.sleep(this.timeout);
        }
    }

     /** General drawing method for the label widget. */
     render() {
        // Clear the old content.
        this._canvas._container.removeChildren();

        // render all widgets.
        for (var i =0; i < this.widgets.length; i++) {
            // Add the widget to the container.
            this._canvas._container.addChild(this.widgets[i]._container);

            // Render the widget.
            this.widgets[i].render();
        }
    
        // Show the form.
        this._canvas.show(this.experiment);
    }

    /**
     * Add a widget to a location on the form.
     * @param {Object} widget - The widget to add to the form.
     * @param {Object} pos - The position of the widget.
     * @param {Number} colSpan - The width of the widget.
     * @param {Number} rowSpan - The height of the widget.
     */
    set_widget(widget, pos, colSpan, rowSpan) {
        // Calculate the form width and height minus the margins.
        var form_width = this.experiment.vars.width - Number(this.margins[1]) - Number(this.margins[3]);
        var form_height = this.experiment.vars.height - Number(this.margins[0]) - Number(this.margins[2]);

        // Calculate the position and dimension of the widget on the form.
        var x = Number(this.margins[3]) + Number(this.spacing);
        for (var i = 0; i < Number(pos[0]); i++) {
            x = x + (Number(this.cols[i]) / this.colNr) * form_width;
        }
        var y = Number(this.margins[0]) + Number(this.spacing);
        for (var i = 0; i < Number(pos[1]); i++) {
            y = y + (Number(this.rows[i]) / this.rowNr) * form_height;
        }
        var width = 0;
        var range = Number(Number(pos[0]) + Number(colSpan));
        for (var i = Number(pos[0]); i < range; i++) {
            width = width + Number(this.cols[i]);
        }
        width = (width / this.colNr) * form_width - 2 * Number(this.spacing);
    
        var height = 0;
        var range = Number(Number(pos[1]) + Number(rowSpan));
        for (var i = Number(pos[1]); i < range; i++) {
            height = height + Number(this.rows[i]);
        }
        height = (height / this.rowNr) * form_height - 2 * Number(this.spacing);

        // Set the widget position and dimensions.
        widget._container.width = Math.round(width);
        widget._container.height = Math.round(height);
        widget._container.x = Math.round(x);
        widget._container.y = Math.round(y);

        // Add the widget to the list.
        this.widgets.push(widget);
    }
}
 