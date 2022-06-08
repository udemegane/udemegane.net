const path = require("path");
const fs = require("fs");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const Dotenv = require('dotenv-webpack');
const appDirectory = fs.realpathSync(process.cwd());
module.exports = {
  entry: path.resolve(appDirectory, "src/app.ts"), // path to the main .ts file
  output: {
    path: path.resolve(__dirname, "dist/"),
    filename: "js/bundlefile.js", // name for the js file that is created/compiled in memory
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  devServer: {
    port: 8888, // port that we're using for local host (localhost:8080)
    // disableHostCheck: true,
    static: {
      directory: path.resolve(appDirectory, "public"),
      
      publicPath: "/",
    },
    // contentBase: path.resolve(appDirectory, "public"), // tells webpack to serve from the public folder
    // 
    hot: true,
  },
  module: {
    rules: [
      {
        test: /\.m?js/,
      },
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /(node_modules|src\/wasm|src\/private_files)/,
      },
      {
        test: /\.(png|jpg|gif|env|glb|stl)$/i,
        use: [{
            loader: 'url-loader',
            options: {
                limit: 8192,
            },
        }, ],
        exclude: /(node_modules|src\/private_files)/,
      }
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      inject: true,
      template: path.resolve(appDirectory, "public/index.html"),
    }),
    new CleanWebpackPlugin(),
    new CopyPlugin({
      patterns: [
        {from: "public/3Dobjects", to: "3Dobjects"},
        {from: "public/texture",to:"texture"},
      ]
    }),
    new Dotenv()
  ],
  mode: "development",
  devtool: "eval-source-map",
};
