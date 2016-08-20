/*
* Definition of the class form.
*/

function form(pExperiment, pCols, pRows, pSpacing, pMargins, pTheme, pItem, pTimeout, pClicks) {
    // Set the class public properties.
    this.clicks = pClicks;
    this.experiment = pExperiment;
    this.height = this.experiment.vars.height;
    this.item = (pItem != null) ? pItem : pExperiment;
    this.margins = pMargins;
    this.spacing = pSpacing;
    this.span = [];
    this.timeout = pTimeout;
    this.widgets = [];
    this.width = this.experiment.vars.width;

    // Set the class public properties - columns and rows.
    var colSize = 0;
    for (var i = 0; i < pCols.length; i++) {
        colSize = colSize + Number(pCols[i]);
    }
    this.cols = [];
    for (var i = 0; i < pCols.length; i++) {
        this.cols.push(Math.round((pCols[i] / colSize) * 100));
    }
    var rowSize = 0;
    for (var i = 0; i < pRows.length; i++) {
        rowSize = rowSize + Number(pRows[i]);
    }
    this.rows = [];
    for (var i = 0; i < pRows.length; i++) {
        this.rows.push(Math.round((pRows[i] / rowSize) * 100));
    }

    // Set the class private properties.
    this._parentform = document.getElementById('osweb_form');
    this._form = document.createElement("DIV");
    this._form.style.height = '100%';
    this._form.style.width = '100%';
    this._form.style.display = 'none';

    // Set the table properties and content.
    this._table = document.createElement("TABLE");
    this._table.style.padding = this.margins[0] + 'px ' + this.margins[1] + 'px ' + this.margins[2] + 'px ' + this.margins[3] + 'px';
    this._table.style.height = '100%';
    this._table.style.width = '100%';
    this._table.style.fontStyle = this.experiment.vars.font_italic == 'yes' ? 'italic' : 'normal';
    this._table.style.fontWeight = this.experiment.vars.font_bold == 'yes' ? 'bold' : 'normal';
    this._table.style.fontFamily = this.experiment.vars.font_family;
    this._table.style.color = this.experiment.vars.foreground;
    this._table.style.fontSize = this.experiment.vars.font_size + 'px';

    for (var i = 0; i < this.rows.length; i++) {
        // Insert the row into the table.
        var row = this._table.insertRow();
        row.style.height = this.rows[i] + '%';

        // Inser the cells.
        for (var j = 0; j < this.cols.length; j++) {
            var cell = row.insertCell(j);
            cell.style.width = this.cols[j] + '%';
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
p.clicks = null;
p.experiment = null;
p.height = -1;
p.item = null;
p.spacing = null;
p.timeout = -1;
p.width = -1;

/*
 * Definition of public methods - general function.
 */

p._exec = function(pFocus_widget) {};

p.timed_out = function() {};

p.cell_index = function(pPos) {};

p.validate_geometry = function() {};

p.get_cell = function(pIndex) {};

p.get_rect = function(pIndex) {};

p.render = function() {
    this.validate_geometry();
    this.canvas.clear();
    for (var widget in this.widgets) {
        if (widget !== null) {
            widget.render();
        }
    }

    this.canvas.show();
};

p.set_widget = function(pWidget, pPos, pColspan, pRowspan) {
    // Get the row postition of the widget.
    var row = this._table.rows[Number(pPos[1])];
    var cell = row.cells[Number(pPos[0])];
    if (Number(pColspan) > 1) {
        cell.colSpan = Number(pColspan);
    }
    if (Number(pRowspan) > 1) {
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

p.xy_to_index = function(pXy) {};

// Bind the form class to the osweb namespace.
module.exports = form;