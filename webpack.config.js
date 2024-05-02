const path = require('path');

module.exports = [
  {
    entry: './lib/lambda/get-product-by-id.ts',
    target: 'node',
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
      filename: 'get-product-by-id.js',
      path: path.resolve(__dirname, 'dist'),
      libraryTarget: 'commonjs2',
    },
  },
  {
    entry: './lib/lambda/get-products.ts',
    target: 'node',
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
      filename: 'get-products.js',
      path: path.resolve(__dirname, 'dist'),
      libraryTarget: 'commonjs2',
    },
  },
  {
    entry: './lib/lambda/create-product.ts',
    target: 'node',
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
      filename: 'create-product.js',
      path: path.resolve(__dirname, 'dist'),
      libraryTarget: 'commonjs2',
    },
  },
];