(function() {
    // Definition of the class Style.
    // 
    // Style is a simple class that holds information about the style with which
    // a stimulus is to be drawn. One simply uses style by storing the desired
    // style information in it. For instance, to store a color and a penwidth
    // one should simply do
    // 
    //     style = new Styles()
    //     style.color = "#F00"
    //     style.penwidth = 3
    //     
    function Styles() {
        // this.color = null;
        // this.background_color = null;
        // this.fill = null;
        // this.penwidth = null;
        // this.bidi = null
        // this.html = null;
        // this.font_family = null;
        // this.font_size = null;
        // this.font_italic = null;
        // this.font_bold = null;
        // this.font_underline = null;
    };

    // Extend the class from its base class.
    var p = Styles.prototype;

    // Bind the Style class to the osweb namespace.
    osweb.Styles = Styles;
}());