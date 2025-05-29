const path = require('path');

module.exports = {
  target: 'node', // VS Code extensions run in a Node.js-context
  mode: 'development', // Can be 'production' or 'development'
  
  entry: './src/extension.js', // The entry point of this extension
  output: {
    path: path.resolve(__dirname, 'out'),
    filename: 'extension.js',
    libraryTarget: 'commonjs2'
  },
  
  externals: {
    vscode: 'commonjs vscode' // The vscode-module is created on-the-fly and must be excluded
  },
  
  resolve: {
    extensions: ['.js']
  },
  
  devtool: 'nosources-source-map'
};