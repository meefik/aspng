import {
  MAX_DATA_LENGTH,
  dataToImage,
  imageToData,
  injectData,
  extractData,
} from "./utils.js";

/**
 * Converts a Blob into a Uint8Array, passing other values through unchanged.
 *
 * @param {Blob|Uint8Array} data The data to convert.
 * @returns {Promise<Uint8Array>} The data as a Uint8Array.
 */
async function toBytes(data) {
  if (data && typeof data.arrayBuffer === "function") {
    return new Uint8Array(await data.arrayBuffer());
  }
  return data;
}

/**
 * Creates a 2D canvas context of the given size.
 *
 * @param {number} width The canvas width.
 * @param {number} height The canvas height.
 * @returns {CanvasRenderingContext2D} The canvas context.
 */
function createContext(width, height) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas.getContext("2d");
}

/**
 * Reads the pixels of an image blob without color space conversion.
 *
 * @param {Blob} blob The image blob.
 * @returns {Promise<ImageData>} The image pixels.
 */
async function readImageData(blob) {
  const bitmap = await createImageBitmap(blob, {
    premultiplyAlpha: "none",
    colorSpaceConversion: "none",
  });
  const ctx = createContext(bitmap.width, bitmap.height);
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();
  return ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
}

/**
 * Writes pixels to a canvas and exports them as a PNG blob.
 *
 * @param {ImageData} image The image pixels.
 * @returns {Promise<Blob>} The PNG image blob.
 */
function writeImageData(image) {
  const ctx = createContext(image.width, image.height);
  ctx.putImageData(image, 0, 0);
  return new Promise((resolve, reject) =>
    ctx.canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error("Failed to create PNG image")),
      "image/png",
    ),
  );
}

/**
 * Encodes data as a PNG image (16 MiB maximum).
 *
 * @param {Blob|Uint8Array} data The data to encode, either as a Blob or Uint8Array.
 * @returns {Promise<Blob>} A promise that resolves to a Blob containing the PNG image.
 */
export async function encode(data) {
  data = await toBytes(data);
  if (data.length > MAX_DATA_LENGTH) {
    throw new RangeError(
      `Data is too large: ${data.length} bytes (maximum ${MAX_DATA_LENGTH} bytes)`,
    );
  }

  const size = Math.ceil(Math.sqrt(data.length / 3 + 1));
  const image = new ImageData(size, size);
  dataToImage(data, image.data);

  return writeImageData(image);
}

/**
 * Decodes data from a PNG image.
 *
 * @param {Blob} blob The PNG image blob to decode.
 * @param {string} [type='application/octet-stream'] Optional MIME type for the resulting Blob.
 * @returns {Promise<Blob>} A promise that resolves to a Blob containing the decoded data.
 */
export async function decode(blob, type = "application/octet-stream") {
  const image = await readImageData(blob);
  const data = imageToData(image.data);

  return new Blob([data], { type });
}

/**
 * Injects the provided data into the given image. Only fully opaque pixels
 * are used, each holding one byte of data.
 *
 * @param {Blob|Uint8Array} data The data to inject, either as a Blob or Uint8Array.
 * @param {Blob|ImageData} img The image into which the data will be injected; an ImageData is not modified.
 * @returns {Promise<Blob>} A promise that resolves to a new Blob containing the image with the injected data.
 */
export async function inject(data, img) {
  data = await toBytes(data);

  let image;
  if (img && typeof img.arrayBuffer === "function") {
    image = await readImageData(img);
  } else {
    image = new ImageData(new Uint8ClampedArray(img.data), img.width, img.height);
  }
  injectData(image.data, data);

  return writeImageData(image);
}

/**
 * Extracts data from a PNG image.
 *
 * @param {Blob} blob The PNG image blob to extract data from.
 * @param {string} [type='application/octet-stream'] Optional MIME type for the resulting Blob.
 * @returns {Promise<Blob>} A promise that resolves to a Blob containing the extracted data.
 */
export async function extract(blob, type = "application/octet-stream") {
  const image = await readImageData(blob);
  const data = extractData(image.data);

  return new Blob([data], { type });
}
