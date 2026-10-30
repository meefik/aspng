import * as asPNG from "../src/index.js";

const urls = {};

/** Replaces the object URL stored under the given key, revoking the old one. */
function objectURL(key, blob) {
  if (urls[key]) URL.revokeObjectURL(urls[key]);
  return (urls[key] = URL.createObjectURL(blob));
}

/** Shows a link to download the resulting data. */
function showResult(id, blob, name) {
  const link = document.getElementById(id);
  link.href = objectURL(id, blob);
  link.download = name;
  link.hidden = false;
}

/** Runs the action and logs its timing and size statistics or its error. */
async function run(action, isize) {
  const t = Date.now();
  try {
    const blob = await action();
    log(Date.now() - t, isize, blob.size);
    return blob;
  } catch (err) {
    document.getElementById("log").innerText = `error: ${err.message}`;
  }
}

/** Encodes the selected file as a PNG image and displays it. */
async function encode(e) {
  const file = e.target.files[0];
  if (!file) return;
  const blob = await run(() => asPNG.encode(file), file.size);
  if (blob) {
    document.getElementById("encoded_out").src = objectURL("encoded", blob);
  }
}

/** Decodes the selected PNG image back to its original data. */
async function decode(e) {
  const file = e.target.files[0];
  if (!file) return;
  const blob = await run(() => asPNG.decode(file), file.size);
  if (blob) showResult("decoded_out", blob, "decoded.bin");
}

/** Injects the data file into the selected image and displays the result. */
async function inject(e) {
  const data = document.getElementById("inject_data").files[0];
  const file = e.target.files[0];
  if (!file) return;
  if (!data) {
    document.getElementById("log").innerText = "error: select a data file first";
    return;
  }
  const blob = await run(() => asPNG.inject(data, file), file.size);
  if (blob) {
    document.getElementById("injected_out").src = objectURL("injected", blob);
  }
}

/** Extracts hidden data from the selected PNG image. */
async function extract(e) {
  const file = e.target.files[0];
  if (!file) return;
  const blob = await run(() => asPNG.extract(file), file.size);
  if (blob) showResult("extracted_out", blob, "extracted.bin");
}

/** Logs timing and size statistics to the page. */
function log(time, isize, osize) {
  const ratio = isize ? `${~~((osize / isize) * 100)} %` : "n/a";
  document.getElementById("log").innerText =
    `time: ${time} ms, input: ${isize} b, output: ${osize} b, ratio: ${ratio}`;
}

window.asPNG = { encode, decode, inject, extract };
