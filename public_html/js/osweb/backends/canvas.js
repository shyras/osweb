
/*
 * Definition of the class canvas.
 */

(function() 
{
    function canvas(pExperiment, pAuto_prepare)
    {
	// set the class public properties.
	this.auto_prepare = (typeof pAuto_prepare === 'undefined') ? true                    : pAuto_prepare;	
	this.experiment   = (typeof pExperiment   === 'undefined') ? osweb.runner.experiment : pExperiment;
		
        // Set the class public properties. 
    	this.background_color = this.experiment.vars.background;
        this.bidi             = this.experiment.vars.bidi == 'yes';
        this.color            = this.experiment.vars.foregound;
        this.fill             = false;
        this.font_bold        = this.experiment.vars.font_bold == 'yes';
        this.font_family      = this.experiment.vars.font_family; 
        this.font_italic      = this.experiment.vars.font_italic == 'yes';
        this.font_size        = this.experiment.vars.font_size;        
        this.font_underline   = this.experiment.vars.font_underline == 'yes';
        this.html             = true;
        this.penwidth         = 1;
        
        // Set the class private properties. 
    	this._container   = new createjs.Container();
        this._font_string = 'bold 18px Courier New';
	this._height      = osweb.runner._canvas.height;
	this._width	  = osweb.runner._canvas.width;
    }; 
	
    // Extend the class from its base class.
    var p = canvas.prototype;
    
    // Define and set the class public properties. 
    p.auto_prepare        = false;
    p.experiment          = null;
    p.uniform_coordinates = false;
	
    /*
     * Definition of private class methods. 
     */
    
    p._arrow_shape = function(pSx, pSy, pEx, pEy, pBody_length, pBody_width, pHead_width)
    {
        // Length
        var d = Math.sqrt(Math.pow(pEy - pSy,2) + Math.pow(pSx - pEx,2));
		
        // Direction.
        var angle       = Math.atan2(pEy - pSy, pEx - pSx);
	var _head_width = (1 - pBody_width) / 2.0;
	pBody_width     = pBody_width / 2.0;
	
        // calculate coordinates
	var p4 = [pEx, pEy];
	var p1 = [pSx + pBody_width * pHead_width * Math.cos(angle - Math.PI / 2), pSy + pBody_width * pHead_width * Math.sin(angle - Math.PI / 2)];
	var p2 = [p1[0] + pBody_length * Math.cos(angle) * d, p1[1] + pBody_length * Math.sin(angle) * d];
	var p3 = [p2[0] + _head_width * pHead_width * Math.cos(angle - Math.PI / 2), p2[1] + _head_width * pHead_width * Math.sin(angle - Math.PI / 2)];
	var p7 = [pSx + pBody_width * pHead_width * Math.cos(angle + Math.PI / 2), pSy + pBody_width * pHead_width * Math.sin(angle + Math.PI / 2)];
	var p6 = [p7[0] + pBody_length * Math.cos(angle) * d, p7[1] + pBody_length * Math.sin(angle) * d];
	var p5 = [p6[0] + _head_width * pHead_width * Math.cos(angle + Math.PI / 2), p6[1] + _head_width * pHead_width * Math.sin(angle + Math.PI / 2)];
	
        return [p1, p2, p3, p4, p5, p6, p7];
    };    
        
    /*
     * Definition of public class methods. 
     */

    p.arrow = function (pSx, pSy, pEx, pEy, pColor, pPenWidth, pBody_length, pBody_width, pHead_width, pFill)
    {
        var points = this._arrow_shape(pSx, pSy, pEx, pEy, pBody_width, pBody_length, pHead_width);
    	var shape = new createjs.Shape();
	shape.graphics.setStrokeStyle(pPenWidth);
	shape.graphics.beginStroke(pColor);
        
        shape.graphics.moveTo(points[0][0],points[0][1]);
	shape.graphics.lineTo(points[1][0],points[1][1]);
	shape.graphics.lineTo(points[2][0],points[2][1]);
	shape.graphics.lineTo(points[3][0],points[3][1]);
	shape.graphics.lineTo(points[4][0],points[4][1]);
	shape.graphics.lineTo(points[5][0],points[5][1]);
	shape.graphics.lineTo(points[6][0],points[6][1]);
	shape.graphics.lineTo(points[0][0],points[0][1]);
	
       	// Add the line item to container.
	this._container.addChild(shape); 
    }; 
    		
    p.circle = function(pX, pY, pR, pFill, pColor, pPenWidth)
    {
	var shape = new createjs.Shape();
	shape.graphics.setStrokeStyle(pPenWidth);
	shape.graphics.beginStroke(pColor);
	if (pFill == 1)
	{
            shape.graphics.beginFill(pColor);
	}
	shape.graphics.drawCircle(pX, pY, pR);
		
	// Add the line item to container..
	this._container.addChild(shape); 
    };

    p.clear = function(pBackround_color)
    {
	// Remove the container from the stage object.
	osweb.runner._stage.removeChild(this._container);
	this._container.removeAllChildren();
    };

    p.close_display = function(pExperiment)
    {
    	console.log('N/A: canvas.close');
    };

    p.copy = function(pCanvas)
    {
    	console.log('N/A: canvas.copy');
    };

    p.ellipse = function(pX, pY, pW, pH, pFill, pColor, pPenWidth)
    {
	var shape = new createjs.Shape();
	shape.graphics.setStrokeStyle(pPenWidth);
	shape.graphics.beginStroke(pColor);
	if (pFill == 1)
	{
    	shape.graphics.beginFill(pColor);
	}
	shape.graphics.drawEllipse(pX, pY, pW, pH); 

	// Add the text item to the parten frame.
	this._container.addChild(shape);
    };

    p.fixdot = function(pX, pY, pColor, pStyle)
    {
        // Check the color and style arguments.      
        pColor = (typeof pColor === 'undefined') ? 'white'   : pColor;
        pStyle = (typeof pStyle === 'undefined') ? 'default' : pStyle;
        
        if (typeof pX === 'undefined')
	{
            if (this.uniform_coordinates == true)
            {
		pX = 0;
            }
            else
            {
                pX = this._width / 2;
            }
	}
	if (typeof pY === 'undefined')
	{
            if (this.uniform_coordinates == true)
            {
		pY = 0;
            }
            else
            {
		pY = this._height / 2;
            }	
	}
		
	var s = 4;
	var h = 2;
		
	if (pStyle.indexOf('large') != -1)
	{
            s = 16;
	}
	else if ((pStyle.indexOf('medium') != -1) || (pStyle == 'default'))
	{
            s = 8;
	}
	else if (pStyle.indexOf('small') != -1)
	{
            s = 4;
	}
	else
	{
            osweb.debug.addError('Unknown style: ' + pStyle);
	}	
		
	if ((pStyle.indexOf('open') != -1) || (pStyle == 'default'))
	{	
            this.ellipse(pX - s, pY - s, 2 * s, 2 * s, 1, pColor, 1);
            this.ellipse(pX - h, pY - h, 2 * h, 2 * h, 1, 'black', 1);
	}
	else if (pStyle.indexOf('filled') != -1)
	{	
            this.ellipse(pX - s, pY - s, 2 * s, 2 * s, 1, pColor, 1);
	}
        else if (pStyle.indexOf('cross') != -1)
	{
            this.line(pX, pY - s, pX, pY + s);
            this.line(pX - s, pY, pX + s, pY);
	}
	else
	{
            osweb.debug.addError('Unknown style: ' + pStyle);
	}	
    };

    p.gabor = function(pX, pY, pOrient, pFreq, pEnv, pSize, pStdev, pPhase, pColor1, pColor2, pBgmode)
    {
	console.log('Not available yet: canvas.gabor');
    };

    p.height = function()
    {
    	return this._heigth();
    };

    p.image = function(pFName, pCenter, pX, pY, pScale)
    {
	// Set the class private properties. 
	var image         = new createjs.Bitmap();
        image.image       = pFName.data;
	image.scaleX      = pScale;
        image.scaleY      = pScale;
        image.snapToPixel = true;
        image.x		  = pX - ((image.image.width  * pScale) / 2);
    	image.y           = pY - ((image.image.height * pScale) / 2);
	
	// Add the text item to the parten frame.
	this._container.addChild(image);
    };
	
    p.init_display = function(pExperiment)
    {
	// Set the dimension properties.
	this._height = pExperiment.vars.height;
    	this._width  = pExperiment.vars.width;
	
	// Initialize the display dimensions.
	osweb.runner._canvas.height = pExperiment.vars.height;
	osweb.runner._canvas.width  = pExperiment.vars.width;
		
	// Initialize the display color.
	osweb.runner._canvas.style.background = pExperiment.vars.background;

        // Set the cursor visibility to none (default).
        osweb.runner._canvas.style.cursor = 'none';

        // Set focus to the experiment canvas.
        osweb.runner._canvas.focus(); 
    };

    p.line = function(pSx, pSy, pEx, pEy, pColor, pPenWidth)
    {
    	var shape = new createjs.Shape();
	shape.graphics.setStrokeStyle(pPenWidth);
	shape.graphics.beginStroke(pColor);
	shape.graphics.moveTo(pSx, pSy);
	shape.graphics.lineTo(pEx, pEy); 

	// Add the line item to container..
	this._container.addChild(shape); 
    };
	
    p.noise_patch = function(pX, pY, pEnv, pSize, pStdev, pColor1, pColor2, pBgmode)
    {
    	console.log('Not available yet: canvas.noise_patch');
    };
	
    p.polygon = function()
    {
    	console.log('Not available yet: canvas.polygon');
    };
	
    p.prepare = function()
    {
    	console.log('N/A: canvas.prepare');
    };
	
    p.rect = function(pX, pY, pW, pH, pFill, pColor, pPenWidth)
    {
    	var shape = new createjs.Shape();
	shape.graphics.setStrokeStyle(pPenWidth);
	shape.graphics.beginStroke(pColor);
	if (pFill == 1)
	{
            shape.graphics.beginFill(pColor);
	}
	shape.graphics.rect(pX, pY, pW, pH); 

	// Add the line item to container..
	this._container.addChild(shape); 
    };
	
    p.set_font = function(pFamily, pSize, pItalic, pBold, pUnderline)
    {
   	// Define the the font styles.
    	var font_bold      = (pBold      == true) ? 'bold '      : '';
        var font_italic    = (pItalic    == true) ? 'italic '    : '';
        var font_underline = (pUnderline == true) ? 'underline ' : '';
        
        // Set the font string.
        this._font_string = font_bold + font_italic + font_underline + pSize + 'px ' + pFamily; 
     };
        
    p.show = function()
    {
    	// Add the container to the stage object and update the stage.
	osweb.runner._stage.addChild(this._container);
	osweb.runner._stage.update(); 

	// Return the current time.
	if (this.experiment != null)
        {
            return this.experiment.clock.time();
        }    
        else
        {    
            return null;
        }
    };
	
    p.size = function()
    {
    	// Create object tuple.
    	var size = {width: this._width, height: this._height};
	return size;
    };
	
    p.text = function(pText, pCenter, pX, pY , pColor, pHtml)
    {
	// Create the text element.          
	var text = new createjs.Text(pText, this._font_string, pColor);

	// Set the text element properties.
	text.x = pX - (text.getMeasuredWidth() / 2);
	text.y = pY - (text.getMeasuredHeight() / 2);
		 
	// Add the text item to the parten frame.
	this._container.addChild(text);
    };

    p.text_size = function(pText, pMax_width, pStyle_args)
    {
    };

    // Bind the canvas class to the osweb namespace.
    osweb.canvas = canvas;
}());

