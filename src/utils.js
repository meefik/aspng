/**
 * The maximum data length that fits into the 3-byte length header (16 MiB - 1).
 */
export const MAX_DATA_LENGTH = Math.pow(256, 3) - 1;

/**
 * Encodes raw data bytes into an image pixel buffer.
 * The first pixel stores the data length as a 3-byte little-endian integer,
 * and subsequent pixels encode groups of 3 bytes per pixel (RGB).
 *
 * @param {Uint8Array} [data] The raw data to encode.
 * @param {Uint8Array} [img] The target pixel buffer (RGBA format).
 * @returns {Uint8Array} The filled pixel buffer.
 */
export function dataToImage(data = [], img = []) {
  const size = data.length;
  if (size > MAX_DATA_LENGTH) {
    throw new RangeError(
      `Data is too large: ${size} bytes (maximum ${MAX_DATA_LENGTH} bytes)`,
    );
  }
  for (let i = 0; i < 3; i++) {
    img[i] = ((size / Math.pow(256, i)) % 256) | 0;
  }
  img[3] = 255;
  for (let i = 4, j = 0, l = img.length; i < l; i += 4, j += 3) {
    img[i] = data[j] || 0;
    img[i + 1] = data[j + 1] || 0;
    img[i + 2] = data[j + 2] || 0;
    img[i + 3] = 255;
  }
  return img;
}

/**
 * Decodes raw data bytes from an image pixel buffer.
 * Reads the data length from the first pixel, then extracts groups
 * of 3 bytes per pixel (RGB) until all data is recovered.
 *
 * @param {Uint8Array} [img] The pixel buffer to decode from (RGBA format).
 * @returns {Uint8Array} The decoded raw data.
 */
export function imageToData(img = []) {
  let size = 0;
  for (let i = 0; i < 3; i++) {
    size += img[i] * Math.pow(256, i);
  }
  const data = new Uint8Array(size);
  const l = img.length;
  for (let i = 4, j = 0; i < l && j < size; i += 4, j += 3) {
    for (let k = 0; k < 3 && j + k < size; k++) {
      data[j + k] = img[i + k];
    }
  }
  return data;
}

/**
 * Hides data inside an image by encoding each byte as three base-`basis`
 * digits, one per color channel (RGB) of a pixel. The bytes are spread
 * evenly across the image, and the remaining pixels are filled with a marker
 * value that is skipped on extraction. Pixels that are not fully opaque are
 * left untouched, because the canvas does not preserve their color values.
 *
 * @param {Uint8Array} [img] The target pixel buffer (RGBA format).
 * @param {Uint8Array} [data] The data to hide in the image.
 * @param {number} [basis=7] The base for encoding each color channel.
 * @returns {Uint8Array} The modified pixel buffer with hidden data.
 */
export function injectData(img = [], data = [], basis = 7) {
  const il = img.length / 4;
  const dl = data.length;
  const max = Math.pow(basis, 3) - 1;
  let capacity = 0;
  for (let i = 0; i < il; i++) {
    if (img[i * 4 + 3] === 255) capacity++;
  }
  if (dl > capacity) {
    throw new RangeError(
      `Data is too large: ${dl} bytes (image can hold ${capacity} bytes)`,
    );
  }
  const step = dl > 0 ? (capacity / dl) | 0 : 1;
  for (let i = 0, o = 0, k = 0; i < il; i++) {
    const p = i * 4;
    if (img[p + 3] !== 255) continue;
    let v = max;
    if (k < dl && o % step === 0) {
      v = data[k++] || 0;
    }
    o++;
    for (let j = 0; j < 3; j++) {
      const x = img[p + j];
      let r = ((x / basis) | 0) * basis;
      if (r + basis > 255) r -= basis;
      img[p + j] = (v % basis) + r;
      v = (v / basis) | 0;
    }
  }
  return img;
}

/**
 * Extracts hidden data from an image that was encoded with {@link injectData}.
 *
 * @param {Uint8Array} [img] The pixel buffer to extract data from (RGBA format).
 * @param {number} [basis=7] The base used during encoding.
 * @returns {Uint8Array} The extracted hidden data.
 */
export function extractData(img = [], basis = 7) {
  const il = img.length / 4;
  const data = [];
  const max = Math.pow(basis, 3) - 1;
  for (let i = 0, k = 0; i < il; i++) {
    const p = i * 4;
    if (img[p + 3] !== 255) continue;
    let v = 0;
    for (let j = 0; j < 3; j++) {
      const x = img[p + j];
      let r = ((x / basis) | 0) * basis;
      if (r + basis > 255) r -= basis;
      v += (x - r) * Math.pow(basis, j);
    }
    if (v < max) data[k++] = v;
  }
  return new Uint8Array(data);
}
