module.exports = function(osweb){
    "use strict";
    // Definition of the class themes. 
    function themes() {
        throw 'The class themes cannot be instantiated!';
    }

    // Definition of public properties.   
    themes.gray = {backgroundColor : '#888a85', lineColorLeftTop: '#babdb6', lineColorRightBottom: '#555753'};

    // Bind the themes class to the osweb namespace.
    return themes;
};    