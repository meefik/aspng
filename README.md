# asPNG

A JavaScript library for encoding data as PNG with compression or injecting data into an existing PNG image.

## How to use

An example of using the basic functions of the library:

```js
// encode file to PNG
const encoded = await asPNG.encode(file);

// decode file from PNG
const decoded = await asPNG.decode(encoded);

// inject data into a PNG image
const injected = await asPNG.inject(data, img);

// extract hidden data from a PNG image
const extracted = await asPNG.extract(injected);
```

## Build and run

Build the library bundle in the directory `./dist/`:

```sh
npm install
npm run build
```

Start the demo web server:

```sh
npm run dev
```
