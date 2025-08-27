// webpack 설정 임시 비활성화 (Express 앱 직접 실행용)
const path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/main.ts',
  target: 'node',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    libraryTarget: 'commonjs2',
    path: path.join(__dirname, 'dist'),
    filename: 'main.js',
  },
  externals: ['aws-sdk'],
  optimization: {
    minimize: false,
  },
};
