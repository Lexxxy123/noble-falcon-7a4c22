// Polyfill for File API and FormData (required for Node.js < 20)
// This file must be required BEFORE any other modules that use undici/node-fetch

if (typeof globalThis.File === 'undefined') {
  const { Blob } = require('buffer');
  class File extends Blob {
    constructor(fileBits, fileName, options = {}) {
      super(fileBits, options);
      this.name = fileName;
      this.lastModified = options.lastModified || Date.now();
    }
  }
  globalThis.File = File;
  console.log('[POLYFILL] File API polyfill applied');
}

if (typeof globalThis.FormData === 'undefined') {
  try {
    const undiciFormData = require('undici').FormData;
    globalThis.FormData = undiciFormData;
  } catch (e) {
    // FormData not needed or undici not available
  }
}

module.exports = {};
