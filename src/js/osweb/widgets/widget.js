
"use strict";
// Definition of the class widget.
function widget(pForm) {
    // Set the class private properties.
    this._element = document.createElement("div");
        
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

// Definition of private methods - general function.

p.convert_value = function(pValue) {
    // Convert html value types (number, px of % to number);
    if (typeof pValue === 'number') {
        return pValue;
    }
    else {
        if (pValue.indexOf('px') !== -1) {
            return pValue.slice(0,pValue.indexOf('px'));
        } 
        else if (pValue.indexOf('%') !== -1) {
            return pValue.slice(0,pValue.indexOf('%'));
        }
        else {
            return Number(pValue);
        }    
    }
};

// Definition of public methods - general function.

p.draw_frame = function(pRect, PStyle) {
    // Draw a frame around the widget.    
    this._element.style.backgroundColor = osweb.themes[this.form.theme].backgroundColor;
    this._element.style.borderColor = osweb.themes[this.form.theme].lineColorLeftTop + ' ' + 
                                      osweb.themes[this.form.theme].lineColorRightBottom + ' ' + 
                                      osweb.themes[this.form.theme].lineColorRightBottom + ' ' +
                                      osweb.themes[this.form.theme].lineColorLeftTop; 
    this._element.style.borderWidth = "1px";
    this._element.style.borderStyle = "solid";
};

p.box_size = function() {
    return null;
};

p.theme_engine = function() {
    return null;
};

p.on_mouse_click = function(pEvent) {
};

p.render = function() {
};

p.set_rect = function(pRect) {
};

p.set_var = function(pVal, pVar) {
    // Sets an experimental variable.
    if (pVar === null) {
        pVar = this.vars;
    }

    if (pVar !== null) {
        this.form.experiment.vars.set(pVar, pVal);
    }
};

// Bind the widget class to the osweb namespace.
module.exports = widget;
