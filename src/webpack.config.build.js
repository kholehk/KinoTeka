const path = require('path');
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

module.exports = {
   mode: 'production',
   entry: './index.js',
   output: {
      filename: 'main.[hash].js',
      path: path.resolve(__dirname, '../build'),
   },
   module: {
      rules: [
         {
            test: /\.tsx?$/,
            loader: 'ts-loader',
            exclude: /node_modules/,
            options: {
               // disable type checker - we will use it in fork plugin
               transpileOnly: true
            }
         },
         {
            test: /\.js$/,
            exclude: /node_modules/,
            use: ['babel-loader'],
         },
         {
            test: /\.css$/i,
            use: [MiniCssExtractPlugin.loader, 'css-loader'],
         },
         {
            test: /\.s[ac]ss$/i,
            use: [
               'style-loader',
               'css-loader',
               'sass-loader',
            ],
         },
         {
            test: /\.html$/i,
            // use: ['file-loader?name=[name].[ext]', 'extract-loader', 'html-loader'],
            loader: 'html-loader',
         }
      ],
   },
   plugins: [
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({
         template: './index.html',
      }),
      new MiniCssExtractPlugin(),
      new webpack.HotModuleReplacementPlugin(),
      new ForkTsCheckerWebpackPlugin()
   ],
}