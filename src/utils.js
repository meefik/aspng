export function dataToImage(data = [], img = []) {
  for (let i = 0, size = data.length; i < 3; i++) {
    img[i] = (size / Math.pow(256, i)) % 256 | 0;
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

export function imageToData(img = []) {
  let size = 0;
  for (let i = 0; i < 3; i++) {
    size += img[i] * Math.pow(256, i);
  }
  const data = new Uint8Array(size);
  root: for (let i = 4, j = 0, l = img.length; j < l; i += 4, j += 3) {
    for (let k = 0; k < 3; k++) {
      if (j + k >= size) break root;
      data[j + k] = img[i + k];
    }
  }
  return data;
}

export function injectData(img = [], data = [], basis = 7) {
  const il = img.length / 4;
  const dl = data.length;
  const max = Math.pow(basis, 3) - 1;
  const step = (il / dl) | 0;
  for (let i = 0, k = 0; i < il; i++) {
    const p = i * 4;
    let v = max;
    if (k < dl && i % step === 0) {
      v = data[k++] || 0;
    }
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

export function extractData(img, basis = 7) {
  const il = img.length / 4;
  const data = [];
  const max = Math.pow(basis, 3) - 1;
  for (let i = 0, k = 0; i < il; i++) {
    const p = i * 4;
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
