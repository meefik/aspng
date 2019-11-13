const path = require('path');

module.exports = function(env, argv) {
  const devMode = argv.mode !== 'production';
  return {
    mode: devMode ? 'development' : 'production',
    devtool: devMode ? 'source-map' : false,
    entry: './src/index.js',
    output: {
      path: path.resolve(__dirname, './dist'),
      filename: 'aspng.js',
      libraryTarget: 'umd',
      libraryExport: 'default',
      library: 'asPNG',
      umdNamedDefine: true,
      globalObject: 'typeof self !== "undefined" ? self : this'
    },
    module: {
      rules: [
        {
          test: /\.(js)$/,
          exclude: /(node_modules)/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          }
        }
      ]
    }
  };
};
