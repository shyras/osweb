/** Class representing a file pool. */
osweb.file_pool_store = class FilePoolStore {
    /**
     * Create a file store object for all stimuli files.
     * @param {Object} runner - The runner to which the file store belongs.
     */
    constructor(runner) {
        // Create and set private properties. 
        this._items = []; // Container for all pool items.
        this._runner = runner; // Parent runner attached to the file pool.    
    }   

    /**
     * General function for adding an item to the pool.
     * @param {Object} item - The item which is added to the pool.
     */
    add(item) {
        // Add the item to the pool.
        this._items.push(item);

        // Link the item as property
        this[item.name] = item;
    }

    /** Clear all the items in the store. */
    clean_up() {
        // Clear the items.
        this._items = [];
    }
}
 