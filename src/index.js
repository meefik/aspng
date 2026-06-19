import { dataToImage, imageToData, injectData, extractData } from "./utils.js";

/**
 * Encodes data as a PNG image (4 GiB maximum).
 *
 * @param {Blob|Uint8Array} data The data to encode, either as a Blob or Uint8Array.
 * @returns {Promise<Blob>} A promise that resolves to a Blob containing the PNG image.
 */
export async function encode(data) {
  if (data && typeof data.arrayBuffer === "function") {
    data = new Uint8Array(await data.arrayBuffer());
  }

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const size = Math.ceil(Math.sqrt(data.length / 3 + 1));
  canvas.width = size;
  canvas.height = size;

  const image = ctx.getImageData(0, 0, size, size);
  dataToImage(data, image.data);
  ctx.putImageData(image, 0, 0);

  return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
}

/**
 * Decodes data from a PNG image.
 *
 * @param {Blob} blob The PNG image blob to decode.
 * @param {string} [type='application/octet-stream'] Optional MIME type for the resulting Blob.
 * @returns {Promise<Blob>} A promise that resolves to a Blob containing the decoded data.
 */
export async function decode(blob, type = "application/octet-stream") {
  const bitmap = await createImageBitmap(blob);

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;

  ctx.drawImage(bitmap, 0, 0);
  const imgData = ctx.getImageData(0, 0, bitmap.width, bitmap.height).data;
  const data = imageToData(imgData);

  return new Blob([data], { type });
}

/**
 * Injects the provided data into the given image blob.
 *
 * @param {Blob|Uint8Array} data The data to inject, either as a Blob or Uint8Array.
 * @param {Blob} img The image blob into which the data will be injected.
 * @returns {Promise<Blob>} A promise that resolves to a new Blob containing the image with the injected data.
 */
export async function inject(data, img) {
  if (data && typeof data.arrayBuffer === "function") {
    data = new Uint8Array(await data.arrayBuffer());
  }

  let imgData;
  if (img && typeof img.arrayBuffer === "function") {
    const bitmap = await createImageBitmap(img);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;

    ctx.drawImage(bitmap, 0, 0);
    imgData = ctx.getImageData(0, 0, bitmap.width, bitmap.height);
  } else {
    imgData = img;
  }

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = imgData.width;
  canvas.height = imgData.height;

  injectData(imgData.data, data);
  ctx.putImageData(imgData, 0, 0);

  return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
}

/**
 * Extracts data from a PNG image.
 *
 * @param {Blob} blob The PNG image blob to extract data from.
 * @param {string} [type='application/octet-stream'] Optional MIME type for the resulting Blob.
 * @returns {Promise<Blob>} A promise that resolves to a Blob containing the extracted data.
 */
export async function extract(blob, type = "application/octet-stream") {
  const bitmap = await createImageBitmap(blob);

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;

  ctx.drawImage(bitmap, 0, 0);
  const imgData = ctx.getImageData(0, 0, bitmap.width, bitmap.height).data;
  const data = extractData(imgData);

  return new Blob([data], { type });
}
