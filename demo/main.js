import * as asPNG from "../src/index.js";

/** Encodes the selected file as a PNG image and displays it. */
async function encode(e) {
  const file = e.target.files[0];
  const t = Date.now();
  const blob = await asPNG.encode(file);
  log(Date.now() - t, file.size, blob.size);
  document.getElementById("encoded_out").src = URL.createObjectURL(blob);
}

/** Decodes the selected PNG image back to its original data. */
async function decode(e) {
  const file = e.target.files[0];
  const t = Date.now();
  const blob = await asPNG.decode(file);
  log(Date.now() - t, file.size, blob.size);
  window.open(URL.createObjectURL(blob));
}

/** Injects the data file into the selected image and displays the result. */
async function inject(e) {
  const data = document.getElementById("inject_data").files[0];
  const file = e.target.files[0];
  const t = Date.now();
  const blob = await asPNG.inject(data, file);
  log(Date.now() - t, file.size, blob.size);
  document.getElementById("injected_out").src = URL.createObjectURL(blob);
}

/** Extracts hidden data from the selected PNG image. */
async function extract(e) {
  const file = e.target.files[0];
  const t = Date.now();
  const blob = await asPNG.extract(file);
  log(Date.now() - t, file.size, blob.size);
  window.open(URL.createObjectURL(blob));
}

/** Logs timing and size statistics to the page. */
function log(time, isize, osize) {
  document.getElementById("log").innerText =
    `time: ${time} ms, input: ${isize} b, output: ${osize} b, ratio: ${~~((osize / isize) * 100)} %`;
}

window.asPNG = { encode, decode, inject, extract };
