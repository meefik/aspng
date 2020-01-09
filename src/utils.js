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

export function injectData(img = [], data = [], start = 0, basis = 7) {
  const size = data.length;
  for (let i = start, l = start + size; i < l; i++) {
    const step = i * 4;
    let value = data[i - start] || 0;
    for (let j = 0; j < 3; j++) {
      let x = img[step + j];
      let r = ~~(x / basis) * basis;
      if (r + basis > 255) r -= basis;
      img[step + j] = r + (value % basis);
      value = ~~(value / basis);
    }
  }
  return img;
}

export function extractData(img, start = 0, end = img.length / 4, basis = 7) {
  const data = new Uint8Array(end - start);
  for (let i = start; i < end; i++) {
    const step = i * 4;
    let value = 0;
    for (let j = 0; j < 3; j++) {
      let x = img[step + j];
      let r = ~~(x / basis) * basis;
      if (r + basis > 255) r -= basis;
      const n = x - r;
      value += n * Math.pow(basis, j);
    }
    data[i - start] = value;
  }
  return data;
}

export function intToBytes(num) {
  return new Uint8Array([
    (num & 0xff000000) >> 24,
    (num & 0x00ff0000) >> 16,
    (num & 0x0000ff00) >> 8,
    num & 0x000000ff
  ]);
}

export function bytesToInt(arr, i = 0) {
  return arr[i] * 16777216 + arr[i + 1] * 65536 + arr[i + 2] * 256 + arr[i + 3];
}

export function hashCode(data = [], start = 0, end = data.length) {
  let hash = 0;
  if (data.length == 0) return hash;
  for (let i = start; i < end; i++) {
    const char = data[i] || 0;
    hash = (hash << 5) - hash + char;
    hash |= hash;
  }
  return hash < 0 ? hash * -2 : hash;
}
