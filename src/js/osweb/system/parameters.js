// Definition of the class Parameters.
function parameters() {
    throw 'The class parameters cannot be instantiated!';
}

// Define the private properties. 
parameters._itemCounter = 0;
parameters._parameters = new Array();

// Define the public properties. 
parameters.displaySummary = false;
parameters.useDefaultValues = false;

// Definition of private methods - initialize parameters.   

parameters._initialize = function() {
    // Set properties if defined.
    var parameter = {
        dataType: '0',
        defaultValue: '0',
        name: 'subject_nr',
        title: 'Starting the experiment',
        prompt: 'Please enter the subject number',
        promptEnabled: true
    };

    // Add the subject parameter to the parameters list.
    this._parameters.push(parameter);
    
    // Process the Parameters.        
    this._processParameters();
};

// Definition of private methods - process parameters.   

parameters._processParameters = function() {
    // Process all items for which a user input is required.
    if (this._itemCounter < this._parameters.length) {
        // Process the Parameter.
        if (this.useDefaultValues == false) {
            this._processParameter(this._parameters[this._itemCounter]);
        
        ////////// Is this condition below ever true?? -Daniel
        } else {
            // Transfer the startup info to the context.
            this._transferParameters();
        }
    } else {
        // All items have been processed, contine the Runner processing.
        if (this.displaySummary == true) {
            // Show a summary of the the startup information. 
            this._showParameters();
        } else {
            // Transfer the startup info to the context.
            this._transferParameters();
        }
    }
};

parameters._processParameter = function(parameter) {
    // Check if a user request is required.
    if (parameter.promptEnabled == true) {
        if(parameter.dataType !== "0"){
            document.getElementById('qpbuttonyes').onclick = function() {
                //Get the response information
                parameter.response = value;
                // Close the dialog.
                this._hideDialog();
                // Increase the counter.
                this._itemCounter++;
                // Continue processing.
                this._processParameters();
            }.bind(this);

            document.getElementById('qpbuttonno').onclick = function() {
                // Close the dialog.
                this._hideDialog();

                // Finalize the introscreen elements.
                osweb.runner._exit();
            }.bind(this);
        }
        this._showDialog(parameter);
    } else {
        // Assign default value to the Startup item.
        parameter.response = parameter.defaultValue;

        // Increase the counter.
        this._itemCounter++;

        // Continue processing.
        this._processParameters();
    }
};

parameters._showParameters = function() {
    document.getElementById('dialogboxhead').innerHTML = 'Summary of startup info';
    document.getElementById('qpbuttonyes').onclick = function() {
        // Close the dialog.
        this._hideDialog();

        // Transfer the startup info to the context.
        this._transferParameters();

    }.bind(this);

    document.getElementById('qpbuttonno').onclick = function() {
        // Close the dialog.
        this._hideDialog();

        // Reset the item counter.
        this._itemCounter = 0;

        // Restat the input process.    
        this._processParameters();

    }.bind(this);

    document.getElementById('qpbuttoncancel').onclick = function() {
        // Close the dialog.
        this._hideDialog();

        // Finalize the introscreen elements.
        osweb.runner._exit();
    }.bind(this);

    // Set the dialog interface.
    var TmpString = '';
    for (var i = 0; i < this._parameters.length; i++) {
        if ((this._parameters[i].enabled != 0) && (this._parameters[i].promptEnabled != 0)) {
            TmpString = TmpString + this._parameters[i].name + ': ' + this._parameters[i].response + '\r\n';
        }
    }

    document.getElementById('qpdialogtextarea').innerHTML = TmpString;
};

parameters._transferParameters = function() {
    // Transfer the startup info items to the context.
    for (var i = 0; i < this._parameters.length; i++) {
        osweb.runner.experiment.vars.set(this._parameters[i].name, this._parameters[i].response);
    }
    // Parameters are processed, next phase.
    osweb.screen._setupClickScreen();
};

// Definition of class methods (dialogs).   

parameters._showDialog = function(parameter) {
    var dialogtype = parameter.dataType;

    // I don't know what the dialogtypes other than 0 signify, so I only integrated
    // type 0 with alertify.js
    if(dialogtype !== "0"){
        var dialogoverlay = document.getElementById('dialogoverlay');
        var dialogbox = document.getElementById('dialogbox');

        dialogoverlay.style.display = "block";
        dialogbox.style.display = "block";
    }

    switch (dialogtype) {
        case "0":
            alertify.prompt( 
                parameter.title, 
                parameter.prompt, 
                parameter.defaultValue, 
                function(evt, value) {
                    // Get the response information
                    parameter.response = value;
                    // Increase the counter.
                    this._itemCounter++;
                    // Continue processing.
                    this._processParameters();
                }.bind(this), 
                function() {
                    // Finalize the introscreen elements.
                    osweb.runner._exit();
                }
            );
            // document.getElementById('dialogboxbody').innerHTML = '<input id="qpdialoginput"></input>';
            // document.getElementById('dialogboxfoot').innerHTML = '<button id="qpbuttonyes">Ok</button><button id="qpbuttonno">Cancel</button>';
            // document.getElementById('qpdialoginput').focus();
            break;
        case "1":
            document.getElementById('dialogboxbody').innerHTML = '<input id="qpdialoginput"></input>';
            document.getElementById('dialogboxfoot').innerHTML = '<button id="qpbuttonyes">Ok</button><button id="qpbuttonno">Cancel</button>';
            document.getElementById('qpdialoginput').focus();
            break;
        case "2":
            document.getElementById('dialogboxbody').innerHTML = '<input id="qpdialoginput"></input>';
            document.getElementById('dialogboxfoot').innerHTML = '<button id="qpbuttonyes">Ok</button><button id="qpbuttonno">Cancel</button>';
            document.getElementById('qpdialoginput').focus();
            break;
        case "3":
            document.getElementById('dialogboxbody').innerHTML = '<textarea id="qpdialogtextarea"></textarea>';
            document.getElementById('dialogboxfoot').innerHTML = '<button id="qpbuttonyes">Yes</button><button id="qpbuttonno">No</button><button id="qpbuttoncancel">Cancel</button>';
            document.getElementById('qpdialogtextarea').focus();
            break;
    }
};

parameters._hideDialog = function() {
    dialogoverlay.style.display = "none";
    dialogbox.style.display = "none";
    document.getElementById('dialogboxbody').innerHTML = '';
    document.getElementById('dialogboxfoot').innerHTML = '';
};

/**
 * Resizes the container div (osweb_div), which contains all elements on display
 * @param  {int} width  width to set
 * @param  {int} height height to set
 * @return void
 */
parameters._resizeOswebDiv = function(width, height) {
    document.getElementById('osweb_div').style.width = width + 'px';
    document.getElementById('osweb_div').style.height = height + 'px';
}

// Bind the parameters class to the osweb namespace.
module.exports = parameters;