/**
 * Encodes data as a PNG image (4 GiB maximum).
 *
 * @param data - The data to encode, either as a Blob or Uint8Array.
 * @returns A promise that resolves to a Blob containing the PNG image.
 */
export function encode(data: Blob | Uint8Array): Promise<Blob>;

/**
 * Decodes data from a PNG image.
 *
 * @param blob - The PNG image blob to decode.
 * @param type - Optional MIME type for the resulting Blob. Defaults to 'application/octet-binary'.
 * @returns A promise that resolves to a Blob containing the decoded data.
 */
export function decode(blob: Blob, type?: string): Promise<Blob>;

/**
 * Injects the provided data into the given image blob.
 *
 * @param data - The data to inject, either as a Blob or Uint8Array.
 * @param img - The image blob into which the data will be injected.
 * @returns A promise that resolves to a new Blob containing the image with the injected data.
 */
export function inject(data: Blob | Uint8Array, img: Blob): Promise<Blob>;

/**
 * Extracts data from a PNG image.
 *
 * @param blob - The PNG image blob to extract data from.
 * @param type - Optional MIME type for the resulting Blob. Defaults to 'application/octet-binary'.
 * @returns A promise that resolves to a Blob containing the extracted data.
 */
export function extract(blob: Blob, type?: string): Promise<Blob>;
