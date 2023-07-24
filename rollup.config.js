import terser from '@rollup/plugin-terser';

export default {
  input: 'src/index.js',
  output: [{
    file: 'dist/aspng.min.js',
    format: 'umd',
    name: 'asPNG'
  }],
  plugins: [terser()]
};
