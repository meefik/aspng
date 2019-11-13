/**
 * Encode data as PNG (4 GiB maximum).
 *
 * @param {Blob|Uint8Array} data
 * @return {Blob}
 */
export function encode(data) {
  if (typeof data.arrayBuffer === 'function') {
    return data
      .arrayBuffer()
      .then(arr => new Uint8Array(arr))
      .then(encode);
  }
  return new Promise(resolve => {
    const canvas = document.createElement('canvas');
    const size = Math.ceil(Math.sqrt(data.length / 3 + 1));
    const w = (canvas.width = size);
    const h = (canvas.height = size);
    const ctx = canvas.getContext('2d');
    const img = ctx.getImageData(0, 0, w, h);
    const imgData = img.data;
    imgData[0] = (data.length < 256 ? data.length : data.length % 256) | 0;
    imgData[1] =
      (data.length < 65536 ? data.length / 256 : (data.length / 256) % 256) | 0;
    imgData[2] =
      (data.length < 16777216
        ? data.length / 65536
        : (data.length / 65536) % 256) | 0;
    imgData[3] = 255;
    for (let i = 4, j = 0, l = imgData.length; i < l; i += 4, j += 3) {
      imgData[i] = data[j] || 0;
      imgData[i + 1] = data[j + 1] || 0;
      imgData[i + 2] = data[j + 2] || 0;
      imgData[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    canvas.toBlob(resolve, 'image/png');
  });
}

/**
 * Decode data from PNG.
 *
 * @param {Blob} blob
 * @param {Object} [opts]
 * @return {Blob}
 */
export function decode(blob, opts) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = function() {
      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, img.width, img.height).data;
      const size = imgData[0] + imgData[1] * 256 + imgData[2] * 65536;
      const data = new Uint8Array(size);
      root: for (let i = 4, j = 0, l = imgData.length; j < l; i += 4, j += 3) {
        for (let k = 0; k < 3; k++) {
          if (j + k >= size) break root;
          data[j + k] = imgData[i + k];
        }
      }
      URL.revokeObjectURL(img.src);
      resolve(new Blob([data], opts));
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(blob);
  });
}

export default {
  encode,
  decode
};
