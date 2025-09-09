import {
  dataToImage,
  imageToData,
  injectData,
  extractData,
} from './utils.js';

/**
 * Encodes data as a PNG image (4 GiB maximum).
 *
 * @param {Blob|Uint8Array} data - The data to encode, either as a Blob or Uint8Array.
 * @returns {Promise<Blob>} A promise that resolves to a Blob containing the PNG image.
 */
export function encode(data) {
  if (data && typeof data.arrayBuffer === 'function') {
    return data.arrayBuffer().then(arr => encode(new Uint8Array(arr)));
  }
  return new Promise((resolve) => {
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
 * Decodes data from a PNG image.
 *
 * @param {Blob} blob - The PNG image blob to decode.
 * @param {string} [type='application/octet-binary'] - Optional MIME type for the resulting Blob.
 * @returns {Promise<Blob>} A promise that resolves to a Blob containing the decoded data.
 */
export function decode(blob, type = 'application/octet-binary') {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = function () {
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
 * Injects the provided data into the given image blob.
 *
 * @param {Blob|Uint8Array} data - The data to inject, either as a Blob or Uint8Array.
 * @param {Blob} img - The image blob into which the data will be injected.
 * @returns {Promise<Blob>} A promise that resolves to a new Blob containing the image with the injected data.
 */
export function inject(data, img) {
  if (data && typeof data.arrayBuffer === 'function') {
    return data.arrayBuffer().then(arr => inject(new Uint8Array(arr), img));
  }
  if (img && typeof img.arrayBuffer === 'function') {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = function () {
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
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    injectData(img.data, data);
    ctx.putImageData(img, 0, 0);
    canvas.toBlob(resolve, 'image/png');
  });
}

/**
 * Extracts data from a PNG image.
 *
 * @param {Blob} blob - The PNG image blob to extract data from.
 * @param {string} [type='application/octet-binary'] - Optional MIME type for the resulting Blob.
 * @returns {Promise<Blob>} A promise that resolves to a Blob containing the extracted data.
 */
export function extract(blob, type = 'application/octet-binary') {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = function () {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const w = (canvas.width = image.width);
      const h = (canvas.height = image.height);
      ctx.drawImage(image, 0, 0);
      const imgData = ctx.getImageData(0, 0, w, h).data;
      URL.revokeObjectURL(image.src);
      const data = extractData(imgData);
      resolve(new Blob([data], { type }));
    };
    image.onerror = reject;
    image.src = URL.createObjectURL(blob);
  });
}
