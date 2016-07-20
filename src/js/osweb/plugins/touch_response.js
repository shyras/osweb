/*
 * Definition of the class touch_response.
 */

(function() {
    function touch_response(pExperiment, pName, pScript) {
        // Inherited.
        this.mouse_response_constructor(pExperiment, pName, pScript);
    };

    // Extend the class from its base class.
    var p = osweb.extendClass(touch_response, osweb.mouse_response);

    // Define and set the public properties. 
    p.description = 'A grid-based response item, convenient for touch screens';

    /*
     * Definition of public methods - build cycle.
     */

    p.reset = function() {
        // Inherited.
        this.mouse_response_reset();
        this.vars.set('allowed_responses', null);

        // Resets all item variables to their default value.
        this.vars._ncol = 2;
        this.vars._nrow = 1;
    };

    /*
     * Definition of public methods - run cycle.
     */

    p.prepare = function() {
        // Temp hack
        this.experiment.vars.correct = -1;

        // Inherited.
        this.mouse_response_prepare();
    };

    p.process_response_mouseclick = function(pRetval) {
        // Processes a mouseclick response.
        this.experiment._start_response_interval = this.sri;
        this.experiment._end_response_interval = pRetval.rtTime;
        this.experiment.vars.response = pRetval.resp;
        this.synonyms = this._mouse.synonyms(this.experiment.vars.response);
        this.experiment.vars.cursor_x = pRetval.event.clientX;
        this.experiment.vars.cursor_y = pRetval.event.clientY;

        var rect = osweb.runner._canvas.getBoundingClientRect();
        if (this.experiment.vars.uniform_coordinates == 'yes') {
            this._x = pRetval.event.clientX + (this.experiment.vars.width / 2);
            this._y = pRetval.event.clientY + (this.experiment.vars.height / 2);
        } else {
            this._x = pRetval.event.clientX - rect.left;
            this._y = pRetval.event.clientY - rect.top;
        }

        // Calulate the row, column and cell. 
        this.col = Math.floor(this._x / (this.experiment.vars.width / this.vars._ncol));
        this.row = Math.floor(this._y / (this.experiment.vars.height / this.vars._nrow));
        this.cell = this.row * this.vars._ncol + this.col + 1;
        this.experiment.vars.response = this.cell;
        this.synonyms = [String(this.experiment.vars.response)];

        // Do the bookkeeping 
        this.response_bookkeeping();
    };

    // Bind the touch_response class to the osweb namespace.
    osweb.touch_response = osweb.promoteClass(touch_response, "mouse_response");
}());