const path = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const Dotenv = require('dotenv-webpack');
require('dotenv').config();

module.exports = [
  {
    output: {
      filename: "index.bundle.js",
      path: path.resolve(__dirname, "web/dist"),
    },
    entry: path.resolve(__dirname, "web/src/index.tsx"),
    plugins: [
      new Dotenv(),
      new HtmlWebpackPlugin({
        template: './web/index.html',
        templateParameters: {
            'BASE_URL': process.env.REACT_APP_URL
        }
    })
    ],
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: "ts-loader",
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
        path: require.resolve("path-browserify"),
      },
      extensions: [".tsx", ".ts", ".js"],
    },
    devServer: {
      port: 3001,
      historyApiFallback: {
        index: "index.html",
      },
      static: {
        directory: path.join(__dirname, "web/dist"),
      },
    },
  },
];
