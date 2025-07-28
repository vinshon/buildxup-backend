const path = require("path");
const fs = require("fs");
const CopyPlugin = require("copy-webpack-plugin");
const nodeExternals = require("webpack-node-externals");

// Dynamically detect module entry points
const moduleDir = path.resolve(__dirname);
const entries = {};

// Add main entry point
entries['index'] = path.resolve(__dirname, 'index.js');

// Add module entry points
fs.readdirSync(moduleDir).forEach((name) => {
  if (name.startsWith('module_')) {
    const modulePath = path.join(moduleDir, name, `${name.replace('module_', '')}.js`);
    if (fs.existsSync(modulePath)) {
      entries[name] = modulePath;
    }
  }
});

module.exports = {
  entry: entries,

  target: "node",
  mode: "production",

  resolve: {
    extensions: [".js"],
  },

  externals: [
    nodeExternals(), // Don't bundle node_modules
  ],

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ],
  },

  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "middleware"),
          to: path.resolve(__dirname, "dist/middleware"),
        },
        {
          from: path.resolve(__dirname, "utils"),
          to: path.resolve(__dirname, "dist/utils"),
        },
        {
          from: path.resolve(__dirname, "config"),
          to: path.resolve(__dirname, "dist/config"),
        },
        {
          from: path.resolve(__dirname, "prisma"),
          to: path.resolve(__dirname, "dist/prisma"),
        },
        {
          from: path.resolve(__dirname, "package.json"),
          to: path.resolve(__dirname, "dist/package.json"),
        },
        {
          from: path.resolve(__dirname, "ping.js"),
          to: path.resolve(__dirname, "dist/ping.js"),
        }
      ],
    }),
  ],

  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
    libraryTarget: "commonjs2",
  },
}; 