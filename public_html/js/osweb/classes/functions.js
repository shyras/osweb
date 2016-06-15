
/*
 * Definition of the class functions.
 */

(function() 
{
    function functions() 
    {
	throw "The class functions cannot be instantiated!";
    }

    /*
     * Definition of general function methods.   
     */

    functions._initialize = function()
    {
	window['print']		     = this.print;
		
	// Create the global function calls for use in the inlide script item.
	window['canvas']         = this.canvas;
	window['copy_sketchpad'] = this.copy_sketchpad;
	window['keyboard']       = this.keyboard;
	window['mouse']          = this.mouse;
	window['pause']          = this.pause;
	window['reset_feedback'] = this.reset_feedback;	
	window['sampler']        = this.sampler;
	window['set_response']   = this.set_response;
	window['set_subject_nr'] = this.set_subject_nr;	
	window['sometimes']      = this.sometimes;
	window['synth'] 	 = this.synth;
	window['xy_circle'] 	 = this.xy_circle;
	window['xy_distance'] 	 = this.xy_distance;
	window['xy_from_polar']  = this.xy_from_polar;
	window['xy_grid'] 	 = this.xy_grid;
	window['xy_random'] 	 = this.xy_random;
	window['xy_to_polar']    = this.xy_to_polar;
    };
		
    /*
     * Definition of general function methods.   
     */

    functions.print = function(pString)
    {
	console.log('print output:' + pString);
    };

    /*
     * Definition of general function methods.   
     */

    functions.canvas = function(pAuto_prepare, pStyle_args)
    {
        console.log('warning: function "canvas" not available yet.');
    };

    functions.copy_sketchpad = function(pName)
    {
        console.log('warning: function "copy_sketchpad" not available yet.');
    };

    functions.keyboard = function(pResp_args)
    {
        console.log('warning: function "keyboard" not available yet.');
    };

    functions.mouse = function(pResp_args)
    {
        console.log('warning: function "mouse" not available yet.');
    };

    functions.pause = function()
    {
        console.log('warning: function "pause" not available yet.');
    };

    functions.reset_feedback = function()
    {
        console.log('warning: function "reset_feedback" not available yet.');
    };

    functions.sampler = function(pSrc, pPlayback_args)
    {
        console.log('warning: function "sampler" not available yet.');
    };

    functions.set_response = function(pResponse, pResponse_time, pCorrect)
    {
        console.log('warning: function "set_response" not available yet.');
    };
	
    functions.set_subject_nr = function(pNr)
    {
        console.log('warning: function "set_subject_nr" not available yet.');
    };

    functions.sometimes = function(pP)
    {
        console.log('warning: function "sometimes" not available yet.');
    };

    functions.synth = function(pOsc, pFreq, pLength, pAttack, pDecay)
    {
        console.log('warning: function "synth" not available yet.');
    };

    functions.xy_circle = function(pN, pRho, pPhi0, pPole)
    {
        console.log('warning: function "xy_circle" not available yet.');
    };

    functions.xy_distance = function(pX1, pY1, pX2, pY2)
    {
        console.log('warning: function "xy_distance" not available yet.');
    };

    functions.xy_from_polar = function(pRho, pPhi, pPole)
    {
        console.log('warning: function "xy_from_polar" not available yet.');
    };

    functions.xy_grid = function(pN, pSpacing, pPole)
    {
        console.log('warning: function "xy_grid" not available yet.');
    };

    functions.xy_random = function(pN, pWidth, pHeight, pMin_dist, pPole)
    {
        console.log('warning: function "xy_random" not available yet.');
    };

    functions.xy_to_polar = function(pX, pY, pPole)
    {
        console.log('warning: function "xy_to_polar" not available yet.');
    };

    // Bind the functions class to the osweb namespace.
    osweb.functions = functions;
}()); 

