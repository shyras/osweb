
/*
 * Definition of the class PRNG.
 */

(function() 
{
    function PRNG()
    {
    	throw "The class PRNG cannot be instantiated!";
    }; 
	
    // Set the class private properties. 
    PRNG._previous = 0;
    PRNG._prng     = uheprng();    
    PRNG._seed     = '0';

    /*
     * Definition of class methods (build cycle).   
     */

    PRNG._build = function(properties)
    {
    };

    /*
     * Definition of class methods (run cycle).   
     */
    
    PRNG._initialize = function()
    {
        // Create the random seed. 
        this._prng.initState();
        this._prng.hashString(this._seed); 
    };

    PRNG._finalize = function()
    {
    };
  
    /*
     * Definition of class methods.   
     */

    PRNG._getNext = function() 
    {
        // Get the next random number.
        this._previous = (this._prng(1000000000000000) / 1000000000000000);
        
        // Return function result.
        return this._previous;
	};

    PRNG._getPrevious = function() 
    {
        // Return function result.
        return this._previous;
    };

    PRNG._getSeed = function() 
    {
        // Return the current seed value.
        return this._seed;        
    };

    PRNG._random = function(pMin, pMax) 
    {
        // Calculate the range devider.
        var devider = (1 / ((pMax - pMin) + 1));
         
        // Get the random number and devide it.
        this._previous = ((this._prng(1000000000000000) / 1000000000000000));
        
        // Set the devider.
        this._previous = pMin + Math.floor(this._previous / devider);
               
        // Return function result. 
        return this._previous;
    };

    PRNG._reset = function() 
    {
        // Set the random seed value to 0. 
        this._seed = '0';

        // Reset the PRNG range.
        this._prng.initState();
        this._prng.hashString(String(this._seed));
    };
    
    PRNG._setSeed = function(pSeed) 
    {
        // Set the random seed value. 
        this._seed = String(pSeed);
        
        // Reset the PRNG range.
        this._prng.initState();
        this._prng.hashString(this._seed);
    };

    // Bind the PRNG class to the osweb namespace.
    osweb.PRNG = PRNG;
}());
