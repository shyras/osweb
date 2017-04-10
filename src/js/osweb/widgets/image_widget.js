import Widget from './widget.js';

/**
 * Class representing an OpenSesame label Widget. 
 * @extends Widget
 */
export default class ImageWidget extends Widget {
    /**
     * Create a widget object which represents a text label.
     * @param {Object} form - The form to which the widget belongs.
     * @param {Object} properties - The properties belonging to the widget.
     */
    constructor(form, properties) {
        // Inherited create.
        super(form);

        // Set the class public properties.
        this.adjust = (typeof properties['adjust'] !== 'undefined') ? (properties['adjust'] === 'true') : true;
        this.frame = (typeof properties['frame'] !== 'undefined') ? (properties['frame'] === 'yes') : false;
        this.path = (typeof properties['path'] !== 'undefined') ? properties['path'] : null;
        this.type = 'image';
    }

    /** General drawing method for the label widget. */
    render() {
        // Clear the old content.
        this._container.removeChildren();
   
        // Draw the frame (if enabled).
        if (this.frame === true) {
            this.draw_frame();
        }
        
          // Get image from file pool.
        var name = this.form.experiment._runner._syntax.remove_quotes(this.path);
        var img = this.form.experiment._runner._pool[name].data;

        // Create a temporary canvas to make an image data array.        
        var canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        // Create the image sprite.
        var sprite = new PIXI.Sprite(PIXI.Texture.fromCanvas(canvas));

        // Adjust the dimensions of the sprite.
        if (this.adjust === true) {
            // Calculate the aspect ratio.
            var ar = (img.width / img.height);
            // Adjust the size. 
            if (this._container._height >= this._container._width) {
                // Stretch horizontal.
                sprite.width = this._container._width;
                sprite.height = ar * this._container._width;
                sprite.x = 0;
                sprite.y = (this._container._height - sprite.height) / 2;
            } else {
                // Stretc vertical.
                sprite.height = this._container._height;
                sprite.width = ar * this._container._height;
                sprite.x = (this._container._width - sprite.width) / 2;
                sprite.y = 0;
            }
        } else {
            // No adjusting, just position the sprite in center of the widget.
            sprite.x = (this._container._width / 2) - (sprite.width / 2);
            sprite.y = (this._container._height / 2) - (sprite.height / 2);
        }

        // Add the image to the stage.
        this._container.addChild(sprite);
    }
}
 