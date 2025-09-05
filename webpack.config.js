// Generated using webpack-cli https://github.com/webpack/webpack-cli

const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { DefinePlugin } = require("webpack");
const TerserPlugin = require("terser-webpack-plugin");

require("dotenv").config({
  path: path.join(
    process.cwd(),
    process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : ".env"
  ),
});

const isProduction = process.env.NODE_ENV === "production";
const stylesHandler = MiniCssExtractPlugin.loader;
const PUBLIC_DIR = path.resolve(__dirname, "src/public");

const config = {
  entry: "./src/index.ts",
  devtool: "source-map",
  output: {
    path: path.resolve(__dirname, "dist"),
    publicPath: "/", // важно для корректной выдачи ресурсов
    clean: true,
  },
  devServer: {
    static: {
      directory: PUBLIC_DIR, // раздаём src/public по /
      publicPath: "/",
      watch: true,
    },
    port: 8080,
    host: "localhost",
    open: true,
    hot: true,
    watchFiles: ["src/pages/*.html"],
    // historyApiFallback: true, // если будет SPA-роутинг
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "src/pages/index.html",
      // favicon можно опустить, т.к. раздаём из /, но если хочешь — раскомментируй:
      // favicon: path.resolve(PUBLIC_DIR, "favicon.ico"),
    }),
    new MiniCssExtractPlugin(),
    new DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || (isProduction ? "production" : "development")),
      "process.env.DEVELOPMENT": JSON.stringify(!isProduction),
      "process.env.API_ORIGIN": JSON.stringify(process.env.API_ORIGIN ?? ""),
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/i,
        use: ["babel-loader", "ts-loader"],
        exclude: [/node_modules/],
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          stylesHandler,
          "css-loader",
          "postcss-loader",
          "resolve-url-loader",
          {
            loader: "sass-loader",
            options: {
              sourceMap: true,
              sassOptions: { includePaths: ["src/scss"] },
            },
          },
        ],
      },
      {
        test: /\.css$/i,
        use: [stylesHandler, "css-loader", "postcss-loader"],
      },
      {
        test: /\.(eot|ttf|woff|woff2|png|jpg|jpeg|gif|svg)$/i,
        type: "asset",
        generator: {
          filename: "assets/[hash][ext][query]",
        },
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".jsx", ".js", "..."],
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          keep_classnames: true,
          keep_fnames: true,
        },
      }),
    ],
  },
};

module.exports = () => {
  config.mode = isProduction ? "production" : "development";
  return config;
};
