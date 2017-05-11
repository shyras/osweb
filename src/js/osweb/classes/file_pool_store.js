/** Class representing a file pool. */
export default class FilePoolStore {
    /**
     * Create a file store object for all stimuli files.
     * @param {Object} runner - The runner to which the file store belongs.
     */
    constructor(runner) {
        // Create and set private properties. 
        this._items = []; // Container for all pool items.
        this._runner = runner; // Parent runner attached to the file pool.    
    }   

    /** Clear all the items in the store. */
    _clean_up() {
        // Clear the items.
        this._items = [];
    }

    /**
     * General function for adding an item to the pool.
     * @param {Object} item - The item which is added to the pool.
     */
    add(item, new_name) {
        // Check parameter new_name. 
  		new_name = (typeof new_name === 'undefined') ? null : new_name;
        
        // Set the new name of the item.
        if (new_name !== null) {
            item.name = new_name;
        }
        
        // Add the item to the pool.
        this._items.push(item);

        // Link the item as property
        this[item.name] = item;
    }

    /**
     * Should return the fallback folder bunt osweb this is not functional.
     * @return {null} - always null due to the nature of osweb.
     */
    fallback_folder() {
        // Always returns null because this function is not possible.
        return null;
    }

    /**
     * Create an array with all the files in the store.
     * @return {Array} - An array containing all the files.
     */
    files() {
        // Create a list o keys.
        var files = [];
        for (var i = 0; i < this._items.length; i++) {
            files.push(this._items[i]);
        }

        // Returns a list of item names.
        return files;
    }

    /**
     * Renames a file in the pool folder.
     * @param {String} old_path - The olod file name.
     * @param {String} new_path - The new file name.
     */
    rename(old_path, new_path) {
        for (var i = 0; i < this._items.length; i++) {
            // Check for the old_name.
            if (this._items[i].name === old_path) {
                // Set the new property name.
                this[new_path] = this._items[i];

                // Remove the old property name.
                delete this[old_path];

                // Set the new name.
                this._items[i].name = new_path;
            }
        }    
    }     

    /**
     * Calculates and returns the total size in bytes of all thje fioles.
     * @return {Number} - The size of all files in bytes.
     */
    size() {
        // Create a list of keys.
        var size = 0;
        for (var i = 0; i < this._items.length; i++) {
            size = size + this._items[i].size;
        }    

        // Returns a list of item names.
        return size;
    }
}
 