# asPNG.js

A library for encoding data in PNG with compression.

### How to use

An example of using the basic functions of the library:

```js
// encode file to PNG
asPNG.encode(file).then(blob => {
  // encoded blob
});
// decode file from PNG
asPNG.decode(file).then(blob => {
  // decoded blob
});
// inject data to PNG image
asPNG.inject(data, img).then(blob => {
  // modified image
});
// extract data from PNG image
asPNG.extract(img).then(blob => {
  // extracted data
});
```

## Run demo

Run the dev server:

```
npm install
npm start
```

And open the link in your browser http://localhost:3000
