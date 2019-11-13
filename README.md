# asPNG.js

A library for encoding data in PNG with compression.

### How to use

An example of using the basic functions of the library:

```js
// encode file
asPNG.encode(file).then(blob => {
  // encoded blob
});
// decode file
asPNG.decode(file).then(blob => {
  // decoded blob
});
```

## Run demo

Run the dev server:

```
npm install
npm start
```

And open the link in your browser http://localhost:3000
