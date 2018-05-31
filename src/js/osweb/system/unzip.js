import pako from 'pako';
import isFunction from 'lodash/isFunction';
import untar from 'js-untar';

class FileStreamer {
  constructor(file, chunkSize = 64 * 1024) {
    this.file = file;
    this.offset = 0;
    this.chunkSize = chunkSize; // bytes
    this.rewind();
  }
  rewind() {
    this.offset = 0;
  }
  isEndOfFile() {
    return this.offset >= this.getFileSize();
  }
  readBlock() {
    const fileReader = new FileReader();
    const blob = this.file.slice(this.offset, this.offset + this.chunkSize);

    return new Promise((resolve, reject) => {
      fileReader.onloadend = (event) => {
        const target = (event.target);
        if (target.error) {
          return reject(target.error);
        }

        this.offset += target.result.byteLength;

        resolve({
          data: target.result,
          progress: Math.min(this.offset / this.file.size, 1)
        });
      };

      fileReader.readAsArrayBuffer(blob);
    });
  }
  getFileSize() {
    return this.file.size;
  }
}

export async function decompress(zipfile, onProgress) {
  const fs = new FileStreamer(zipfile);
  const inflator = new pako.Inflate();
  let block;

  while (!fs.isEndOfFile()) {
    block = await fs.readBlock();
    inflator.push(block.data, fs.isEndOfFile());
    if (inflator.err) {
      throw inflator.err
    }
    if (isFunction(onProgress)) onProgress(block.progress)
  }
  return await untar(inflator.result.buffer);
}