const path = require('path');

module.exports = [{
  output: {
    filename: 'index.bundle.js',
    path: path.resolve(__dirname, 'web/dist'),
  },
  entry: path.resolve(__dirname, 'web/src/index.tsx'),
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(sa|sc|c)ss$/, // styles files
        use: ["style-loader", "css-loader", "sass-loader"],
      },
      {
        test: /\.(png|woff|woff2|eot|ttf|svg)$/, // to import images and fonts
        loader: "url-loader",
        options: { limit: false },
      },
    ],
  },
  resolve: {
    fallback: {
      path: require.resolve('path-browserify')
    }, 
    extensions: ['.tsx', '.ts', '.js'],
  },
  devServer: {
    port: 3001,
    historyApiFallback: {
      index: 'index.html'
    },
    static: {
      directory: path.join(__dirname, "web/dist"),
    },
  }
}]