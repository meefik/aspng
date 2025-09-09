# asPNG

A JS library for encoding data as PNG with compression or injecting data into an existing PNG image.

## How to use

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

## Build and run

Build the library bundle in the directory `./dist/`:

```
npm install
npm run build
```

Start the demo webserver:

```
npm run dev
```
