import {
  dataToImage,
  imageToData,
  injectData,
  extractData,
  intToBytes,
  bytesToInt,
  hashCode
} from './utils';

/**
 * Encode data as PNG (4 GiB maximum).
 *
 * @param {Blob|Uint8Array} data
 * @return {Blob}
 */
export function encode(data) {
  if (data && typeof data.arrayBuffer === 'function') {
    return data.arrayBuffer().then(arr => encode(new Uint8Array(arr)));
  }
  return new Promise(resolve => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const size = Math.ceil(Math.sqrt(data.length / 3 + 1));
    const w = (canvas.width = size);
    const h = (canvas.height = size);
    const image = ctx.getImageData(0, 0, w, h);
    dataToImage(data, image.data);
    ctx.putImageData(image, 0, 0);
    canvas.toBlob(resolve, 'image/png');
  });
}

/**
 * Decode data from PNG.
 *
 * @param {Blob} blob
 * @param {string} [type='application/octet-binary']
 * @return {Blob}
 */
export function decode(blob, type = 'application/octet-binary') {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = function() {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const w = (canvas.width = img.width);
      const h = (canvas.height = img.height);
      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, w, h).data;
      const data = imageToData(imgData);
      URL.revokeObjectURL(img.src);
      resolve(new Blob([data], { type }));
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(blob);
  });
}

/**
 * Inject data to PNG image.
 *
 * @param {Blob|Uint8Array} data
 * @param {Blob} img
 * @return {Blob}
 */
export function inject(data, img) {
  if (data && typeof data.arrayBuffer === 'function') {
    return data.arrayBuffer().then(arr => inject(new Uint8Array(arr), img));
  }
  if (img && typeof img.arrayBuffer === 'function') {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = function() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const w = (canvas.width = image.width);
        const h = (canvas.height = image.height);
        ctx.drawImage(image, 0, 0);
        const imgData = ctx.getImageData(0, 0, w, h);
        URL.revokeObjectURL(image.src);
        resolve(imgData);
      };
      image.onerror = reject;
      image.src = URL.createObjectURL(img);
    }).then(image => inject(data, image));
  }
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const w = (canvas.width = img.width);
    const h = (canvas.height = img.height);
    const meta = [...intToBytes(data.length), ...intToBytes(hashCode(data))];
    if (data.length + meta.length > w * h) {
      return reject(
        new Error(
          `Data size limit exceeded (up to ${w * h - meta.length} bytes)`
        )
      );
    }
    injectData(img.data, meta, 0);
    injectData(img.data, data, meta.length);
    ctx.putImageData(img, 0, 0);
    canvas.toBlob(resolve, 'image/png');
  });
}

/**
 * Extract data from PNG image.
 *
 * @param {Blob} blob
 * @param {string} [type='application/octet-binary']
 * @return {Blob}
 */
export function extract(blob, type = 'application/octet-binary') {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = function() {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const w = (canvas.width = image.width);
      const h = (canvas.height = image.height);
      ctx.drawImage(image, 0, 0);
      const imgData = ctx.getImageData(0, 0, w, h).data;
      URL.revokeObjectURL(image.src);
      const meta = extractData(imgData, 0, 8);
      const size = bytesToInt(meta, 0);
      if (size + meta.length > imgData.length / 4) {
        return reject(new Error('Invalid data size'));
      }
      const hash = bytesToInt(meta, 4);
      const data = extractData(imgData, 8, size + 8);
      if (hash !== hashCode(data)) {
        return reject(new Error('Data is corrupted or missing'));
      }
      resolve(new Blob([data], { type }));
    };
    image.onerror = reject;
    image.src = URL.createObjectURL(blob);
  });
}

export default { encode, decode, inject, extract };
