// Generated using webpack-cli https://github.com/webpack/webpack-cli

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const isProduction = process.env.NODE_ENV == 'production';
const stylesHandler = isProduction ? MiniCssExtractPlugin.loader : 'style-loader';

const config = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: "[name].[hash:6].js"
    },
    devServer: {
        open: true,
        host: 'localhost',
        port: 1963,
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: './src/index.html',
        }),
        new MiniCssExtractPlugin({
            filename: '[name].[hash:6].css', // 修改生成路徑
        }),
        // Add your plugins here
        // Learn more about plugins from https://webpack.js.org/configuration/plugins/
    ],
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/i,
                loader: 'babel-loader',
            },
            {
                test: /\.css$/i,
                use: [stylesHandler, 'css-loader', 'postcss-loader'],
            },
            {
                test: /\.(png|jpe?g|gif|ico)$/i,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            publicPath: "./",
                            name: 'img/[name].[ext]',
                        },
                    },
                ],
            },
            {
                test: /\.(svg)$/i,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: true,
                        },
                    },
                ],
            },
            {
                test: /\.(mp3|m4a)$/i,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            publicPath: "./",
                            name: 'audio/[name].[ext]',
                        },
                    },
                ],
            },
            {
                test: /\.(eot|ttf|woff|woff2)$/i,
                type: 'asset',
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: 'asset/[name].[ext]',
                        },
                    },
                ],
            },
        ],
    },
};

module.exports = () => {
    config.mode = isProduction?"production":"development"
    return config;
};
