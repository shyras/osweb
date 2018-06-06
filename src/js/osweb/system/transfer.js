import WebFont from 'webfontloader'
import {
  decompress,
  readFileAsText
} from './util'
import isString from 'lodash/isString'
import isObject from 'lodash/isObject'
import axios from 'axios'

/** Class representing a information stream processor. */
export default class Transfer {
  /**
   * Create a transfer object used for streaming information.
   * @param {Object} runner - The runner class to which the transfer belongs.
   */
  constructor(runner) {
    // Create and set private properties.
    this._runner = runner; // Parent runner attached to the transfer object.
  }

  /**
   * Read an osexp file.
   * @param {Object|String} source - A file object or a String containing the experiment or a download URL.
   */
  async _readSource(source) {
    this._runner._screen._updateIntroScreen('Loading experiment.');
    this._runner._screen._updateProgressBar(-1);

    // Check type of object.
    if (!isString(source) && (!isObject(source) || source.constructor !== File)) {
      this._runner._debugger.addError('No osexp source file defined.');
      return;
    }

    if (source.constructor === File) {
      // Source is a local loaded file. Try to read as text first
      await this._readOsexpFromFile(source);
    } else if (isString(source)) {
      // First try and see if the source string can be parsed as an OS script directly
      try {
        this._processScript(source)
      } catch (e) {
        // If that doesn't work, treat the source as an URL and attempt to read it from
        // the remote server
        await this._readOsexpFromServer(source);
      }
    }
    // Read in and generate the webfonts
    await this._readWebFonts();
    // Build the experiment and fire off!
    this._buildExperiment();
  }

  /**
   * Reading and extracting an osexp file from a file location.
   * @param {Object} file - A file object containing the experiment.
   */
  async _readOsexpFromFile(osexpFile) {
    try {
      const fileAsString = await readFileAsText(osexpFile)
      return this._processScript(fileAsString)
    } catch (e) {
      this._runner._debugger.addMessage(`Could not read osexp file as plain text: ${e.message}. File is probably binary`)
    }
    // Reading and extracting an osexp file from a file location.
    try {
      const files = await decompress(
        osexpFile,
        (progress) => this._runner._screen._updateProgressBar(progress)
      );

      // Find the script in the array of extracted files. Throw an error it isn't found.
      const expFileIndex = files.findIndex((item) => item.name === 'script.opensesame');
      if (expFileIndex === -1) throw new Error('Could not locate experiment script');
      // Pop the script out of the file array and proccess it
      const expFile = files.splice(expFileIndex, 1)[0];
      this._processScript(expFile.readAsString());

      // According to the zlib convention followed by the pako library we use to decompress
      // the osexp file, files have a type of 0, so filter these out.
      const poolFiles = files.filter(
        (item) => item.type == "0"
      );
      // Process the file pool items
      return await this._processOsexpPoolItems(poolFiles);
    } catch (err) {
      this._runner._debugger.addError(`Error reading local osexp: ${err}`);
    }
  }

  /**
   * Reading and extracting an osexp file from a server location.
   * @param {String} url - An url location from which to load an osexp file.
   */
  async _readOsexpFromServer(url) {
    // Osexp files can be basic text files, or be a zip file.
    // Check if mimetype of supplied file is known, and load it accordingly.
    let remoteFile;

    try {
      remoteFile = await this.fetch(url);
    } catch (e) {
      this._runner._debugger.addError('Error transferring osexp: ' + e);
      return;
    }
    return this._readOsexpFromFile(remoteFile);
  }

  /**
   * Reads an osexp file from a remote server, if its type is indicated to be
   * 'text/plain' (opposed to being zipped)
   * @param  {string} url The url at which the osexp can be found
   * @return {void}
   */
  async fetch(url) {
    const response = await axios.get(url, {
      responseType: 'blob',
      onDownloadProgress: (event) => {
        if (event.lengthComputable) {
          this._runner._screen._updateProgressBar(event.loaded / event.total);
        }
      }
    });

    return new File([response.data], 'downloaded.osexp')
  }

  /**
   * Process an osexp script
   * @param  {string} contents - The script contents
   * @return {boolean} - True if script was successfully processed, false otherwise
   */
  _processScript(contents) {
    if (contents.substr(0, 3) !== '---') {
      throw new Error('Specified script file is not valid OpenSesame script')
    }

    // Disable the progressbar.
    this._runner._screen._updateProgressBar(100);
    // Set the script paramter.
    this._runner._script = contents;

    return true;
  }

  /**
   * Asynchronously iterate over file pool files and generate items for them.
   *
   * @param {any} poolFiles The array containing file pool files
   * @returns void
   * @memberof Transfer
   */
  async _processOsexpPoolItems(poolFiles) {
    // Async iterator that handles each file in the poolFiles array
    const asyncIterator = {
      currentIndex: 0,
      next() { // All the action happens here
        const currentFile = poolFiles[this.currentIndex];

        // If currentFile is undefined, then the array has been depleted and all
        // files have been processed. This ends the async iteration properly
        if (!currentFile) return {
          value: undefined,
          done: true
        }

        // Generate the item.
        var item = {
          data: null,
          folder: currentFile.name.match(/(.*)[\/\\]/)[1] || '',
          name: currentFile.name.replace(/^.*[\\\/]/, ''),
          size: currentFile.size,
          type: 'undefined'
        };

        // Determine the file type and generate the appropriate osweb item
        const ext = currentFile.name.substr(currentFile.name.lastIndexOf('.') + 1);
        if ((ext === 'jpg') || (ext === 'png')) {
          // Create a new file pool mage item.
          const img = new Image();
          img.src = currentFile.getBlobUrl();
          item.data = img;
          item.type = 'image';
        } else if ((ext === 'wav') || (ext === 'ogg')) {
          const ado = new Audio();
          ado.src = currentFile.getBlobUrl();
          item.data = ado;
          item.type = 'sound';
        } else if (ext === 'ogv') {
          const ado = document.createElement('VIDEO');
          ado.src = currentFile.getBlobUrl();
          item.data = ado;
          item.type = 'video';
        };
        // Increment the counter.
        this.currentIndex++;

        return {
          value: item,
          done: false
        }
      },
      return () {
        return {};
      },
      // for-await calls this on whatever it's passed, so
      // iterators tend to return themselves.
      [Symbol.asyncIterator]() {
        return this;
      }
    }

    // Iterate over the file pool items
    for await (const item of asyncIterator) {
      // Add the item to the virtual pool.
      this._runner._pool.add(item);

      // Update the progress bar.
      this._runner._screen._updateProgressBar(asyncIterator.currentIndex / poolFiles.length);
    }
  }

  /**
   * Read in webfonts
   *
   * @returns Promise
   * @memberof Transfer
   */
  async _readWebFonts() {
    // Update the introscreen
    this._runner._screen._updateProgressBar(100);
    this._runner._screen._updateIntroScreen('Retrieving required webfonts.');

    return new Promise((resolve, reject) => {
      // Load the required fonts using webfont.
      WebFont.load({
        google: {
          families: ['Droid Sans', 'Droid Serif', 'Droid Sans Mono'],
          urls: ['//fonts.googleapis.com/css?family=Droid Sans',
            '//fonts.googleapis.com/css?family=Droid Serif',
            '//fonts.googleapis.com/css?family=Droid Sans Mono'
          ]
        },
        active: () => resolve(),
        inactive: () => reject(new Error('Could not load webfonts'))
      });
    });
  }

  /**
   * Build the experiment and run it
   *
   * @memberof Transfer
   */
  _buildExperiment() {
    // Update the introscreen
    this._runner._screen._updateIntroScreen('Building experiment structure.');

    // Continue the experiment build.
    this._runner._build();
  }

  /**
   * Writing experiment result data to a location.
   * @param {String} target - An addres to store result data.
   * @param {Object} resultData - The result data itself to store.
   */
  _writeDataFile(target, resultData) {
    // Check if the target and resultData are defined.
    if ((target !== null) && (resultData !== null)) {
      // Add the data as a form element.
      var data = new FormData();
      data.append('data', resultData.toString());

      // Create the request.
      var xhr = new XMLHttpRequest();
      xhr.open('post', target + '?file=subject-' + this._runner._experiment.vars['subject_nr'], true);

      // Send the actual data.
      return xhr.send(data);
    }
  }
}