
"use strict";
// Definition of the class form.
function form(pExperiment, pCols, pRows, pSpacing, pMargins, pTheme, pItem, pTimeout, pClicks) {
    // Set the class public properties.
    this.clicks = pClicks;
    this.cols = pCols;
    this.experiment = pExperiment;
    this.height = this.experiment.vars.height;
    this.item = (pItem != null) ? pItem : pExperiment;
    this.margins = pMargins;
    this.rows = pRows;
    this.spacing = pSpacing;
    this.span = [];
    this.theme = pTheme;
    this.timeout = pTimeout;
    this.widgets = [];
    this.width = this.experiment.vars.width;

    // Calculate the total number ot rows and columns.
    this.colNr = 0;
    for (var i = 0; i < pCols.length; i++) {
        this.colNr = this.colNr + Number(pCols[i]);
    }
    this.rowNr = 0;
    for (var i = 0; i < pRows.length; i++) {
        this.rowNr = this.rowNr + Number(pRows[i]);
    }

    // Set the class private properties.
    this._parentform = document.getElementById('osweb_form');
    this._form = document.createElement("div");
    this._form.style.height = '100%';
    this._form.style.width = '100%';
    this._form.style.padding = this.margins[0] + 'px ' + this.margins[1] + 'px ' + this.margins[2] + 'px ' + this.margins[3] + 'px';
    this._form.style.display = 'none';
    this._form.style.position = 'relative';
    
    // Append the form div to the parent form div.
    this._parentform.appendChild(this._form);
}

// Extend the class from its base class.
var p = form.prototype;

// Definition of class public properties. 
p.clicks = null;
p.experiment = null;
p.height = -1;
p.item = null;
p.spacing = 0;
p.timeout = null;
p.width = -1;

/*
 * Definition of public methods - general function.
 */

p._exec = function(pFocus_widget) {
    // Render the form.
    this.render();

    // Enabled the focus widget.
    if (pFocus_widget != null) {
        // Focus the HTML TextArea element.
        pFocus_widget._text_input.focus();
    }
    
    // Set the onset time.
    this.item.set_item_onset();

    // Set the duration parameter.
    if ((this.timeout !== null) && (this.item !== null)) {
        this.item.sleep(this.timeout);
    };
};

p.timed_out = function() {
};

p.cell_index = function(pPos) {
};

p.validate_geometry = function() {
};

p.get_cell = function(pIndex) {
};

p.get_rect = function(pIndex) {
};

p.render = function() {
    // render all widgets.
    for (var i =0;i < this.widgets.length;i++) {
        this.widgets[i].render();
    }
    
    // Set dimensions.
    this._parentform.style.width = osweb.runner._canvas.width;
    this._parentform.style.height = osweb.runner._canvas.height;
    this._parentform.style.background = this.experiment.vars.background;

    // Hide the canvas, show the form.
    osweb.runner._canvas.style.display = 'none';
    this._parentform.style.display = 'block';
    this._form.style.display = 'inline-block';
};

p.set_widget = function(pWidget, pPos, pColspan, pRowspan) {
    // Calculate the form width and height minus the margins.
    var form_width = this.experiment.vars.width - Number(this.margins[1]) - Number(this.margins[3]);
    var form_height = this.experiment.vars.height - Number(this.margins[0]) - Number(this.margins[2]);
    
    // Calculate the position and dimension of the widget on the form.
    var x = Number(this.margins[3]) + Number(this.spacing);
    for (var i = 0;i < Number(pPos[0]);i++) {
        x = x + (Number(this.cols[i]) / this.colNr) * form_width;
    }
    var y = Number(this.margins[0]) + Number(this.spacing);
    for (var i = 0;i < Number(pPos[1]);i++) {
        y = y + (Number(this.rows[i]) / this.rowNr) * form_height;
    }
    var width = 0;
    var range = Number(Number(pPos[0]) + Number(pColspan));
    for (var i = Number(pPos[0]);i < range;i++) {
        width = width + Number(this.cols[i]);
    }
    width = (width / this.colNr) * form_width - 2 * Number(this.spacing);
    
    var height = 0;
    var range = Number(Number(pPos[1]) + Number(pRowspan));
    for (var i = Number(pPos[1]);i < range;i++) {
        height = height + Number(this.rows[i]);
    }
    height = (height / this.rowNr) * form_height - 2 * Number(this.spacing);

    // Set the widget position and dimensions.
    pWidget._element.setAttribute("style","position:absolute");
    pWidget._element.style.left = String(x) + 'px';
    pWidget._element.style.top = String(y) + 'px';
    pWidget._element.style.width = String(width) + 'px';
    pWidget._element.style.height = String(height) + 'px';
    
    // Append the widhet to the parent form.
    this._form.appendChild(pWidget._element);
    
    // Add the widget to the list.
    this.widgets.push(pWidget);
};

p.xy_to_index = function(pXy) {
};

// Bind the form class to the osweb namespace.
module.exports = form;
