const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require('path');

const assets = ['img'];

const copyPlugins = assets.map(asset => {
  return new CopyWebpackPlugin({
    patterns: [
      {
        from: path.resolve( __dirname, 'src', asset),
        to: path.resolve(__dirname, '.webpack/renderer', asset)
      }
    ]
  });
});

module.exports = [
  new ForkTsCheckerWebpackPlugin(),
  ...copyPlugins
];
