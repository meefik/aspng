import * as asPNG from '../src/index.js';

function encode(e) {
  var file = e.target.files[0];
  var t = Date.now();
  asPNG.encode(file).then((blob) => {
    log(Date.now() - t, file.size, blob.size);
    const img = document.getElementById('encoded_out');
    img.src = URL.createObjectURL(blob);
  });
}

function decode(e) {
  var file = e.target.files[0];
  var t = Date.now();
  asPNG.decode(file).then((blob) => {
    log(Date.now() - t, file.size, blob.size);
    window.open(URL.createObjectURL(blob));
  });
}

function inject(e) {
  var data = document.getElementById('inject_data').files[0];
  var file = e.target.files[0];
  var t = Date.now();
  asPNG.inject(data, file).then((blob) => {
    log(Date.now() - t, file.size, blob.size);
    const img = document.getElementById('injected_out');
    img.src = URL.createObjectURL(blob);
  });
}

function extract(e) {
  var file = e.target.files[0];
  var t = Date.now();
  asPNG.extract(file).then((blob) => {
    log(Date.now() - t, file.size, blob.size);
    window.open(URL.createObjectURL(blob));
  });
}

function log(time, isize, osize) {
  document.getElementById('log').innerText
    = `time: ${time} ms, input: ${isize} b, output: ${osize} b, ratio: ${~~((osize / isize) * 100)} %`;
}

window.encode = encode;
window.decode = decode;
window.inject = inject;
window.extract = extract;
