"use strict";
/*
* Definition of the class file_pool_store.
*/

function file_pool_store() {
    throw "The class file_pool_store cannot be instantiated!";
};

// Definition of private class properties.
file_pool_store._data = [];
file_pool_store._items = [];

/*
 * Definition of private class methods.   
 */

file_pool_store._add = function(item) {
    // Add the item to the pool.
    this._items.push(item);

    // Link the item as property
    this[item.name] = item;
}; 

file_pool_store.add_from_local_source = function(pItem) {
    var ext = pItem.filename.substr(pItem.filename.lastIndexOf('.') + 1);

    if ((ext == 'jpg') || (ext == 'png')) {
        // Create a new file pool mage item.
        var img = new Image();
        img.src = pItem.toDataURL();
        var item = {
            data: img,
            folder: pItem.filename,
            name: pItem.filename.replace(/^.*[\\\/]/, ''),
            size: pItem.length,
            type: 'image'
        };
    } else if ((ext == 'wav') || (ext == 'ogg')) {
        var ado = new Audio();
        ado.src = pItem.toDataURL();
        var item = {
            data: ado,
            folder: pItem.filename,
            name: pItem.filename.replace(/^.*[\\\/]/, ''),
            size: pItem.length,
            type: 'sound'
        };
    } else if (ext == 'ogv') {
        var ado = document.createElement("VIDEO");
        ado.src = pItem.toDataURL();
        var item = {
            data: ado,
            folder: pItem.filename,
            name: pItem.filename.replace(/^.*[\\\/]/, ''),
            size: pItem.length,
            type: 'video'
        };
    }

    // Add the item to the pool.
    this._items.push(item);

    // Link the item as property
    this[item.name] = item;
};

file_pool_store.add_from_server_source = function(pPath, pFiles) {
    console.log('--');
    console.log(pFiles);

    // Check if there are stimuli files.
    if (pFiles.length > 0) {
        // Set the preloader.
        this._queue = new createjs.LoadQueue(false);
        createjs.Sound.registerPlugins([createjs.HTMLAudioPlugin]); // need this so it doesn't default to Web Audio
        this._queue.installPlugin(createjs.Sound);

        this._queue.on("fileload", this._file_complete, this);
        this._queue.on("complete", this._load_complete, this);

        // Add the stimuli information to the loader.
        for (var i = 0; i < pFiles.length; i++) {
            var re = /(?:\.([^.]+))?$/;
            var extention = re.exec(pFiles[i]);
            console.log(extention);

            if (extention[0] == '.ogg') {
                console.log('sound');
                this._queue.loadFile({
                    id: pFiles[i],
                    src: pPath + pFiles[i],
                    type: createjs.AbstractLoader.SOUND
                });
            } else {
                this._queue.loadFile({
                    id: pFiles[i],
                    src: pPath + pFiles[i],
                    type: createjs.AbstractLoader.IMAGE
                });
            }
        }

        // Load the stimuli files.
        this._queue.load();
    } else {
        // Build the experiment objects using the given script.
        osweb.runner._build();
    }
};

file_pool_store._file_complete = function(pEvent) {
    // Update the loader text.
    osweb.runner._updateIntroScreen(osweb.constants.MESSAGE_007);

    // Push the stimulus item to the stimuli object.
    var item = {
        data: pEvent.result,
        folder: pEvent.item.id,
        name: pEvent.item.id.replace(/^.*[\\\/]/, ''),
        size: pEvent.item.id,
        type: 'image'
    };

    // Add the item to the pool.
    this._items.push(item);

    // Link the item as property
    this[item.name] = item;
};

file_pool_store._load_complete = function() {
    // Update the loader text.
    osweb.runner._updateIntroScreen(osweb.constants.MESSAGE_006);

    console.log(this._items);

    // Building is done, go to next phase.
    osweb.runner._build();
};

/*
 * Definition of public class methods.   
 */

file_pool_store.add = function(pPath, pNew_Name) {
    // Copies a file to the file pool. 
};

file_pool_store.fallback_folder = function() {
    // The full path to the fallback pool folder.
};

file_pool_store.files = function() {
    // Returns all files in the file pool.
};

file_pool_store.folder = function() {
    // The full path to the (main) pool folder.
};

file_pool_store.folders = function() {
    // Gives a list of all folders that are searched when retrieving the full path to a file. 
};

file_pool_store.in_folder = function(pPath) {
    // Checks whether path is in the pool folder. 
};

file_pool_store.rename = function(pOld_path, pNew_path) {
    // Renames a file in the pool folder.
};

file_pool_store.size = function() {
    // The combined size in bytes of all files in the file pool.
};

// Bind the stack file_pole_store to the osweb namespace.
module.exports = file_pool_store;