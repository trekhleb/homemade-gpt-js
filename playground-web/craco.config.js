module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Allows direct .ts files import
      webpackConfig.module.rules.push({
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      })
      return webpackConfig
    },
  },
}
