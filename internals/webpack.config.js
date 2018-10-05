const slsw = require('serverless-webpack')

module.exports = {
  entry: slsw.lib.entries,
  target: 'node',
  devtool: 'source-map',
  mode: slsw.lib.webpack.isLocal ? 'development' : 'production',
  externals: [
    /aws-sdk/
  ],
  module: {
    rules: [
      {
        type: 'javascript/auto',
        test: /\.mjs$/,
        use: []
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                [ 'env', {
                  target: {
                    node: '8.10'
                  }
                } ],
                'stage-2'
              ],
              plugins: [
                'transform-runtime'
              ]
            }
          }
        ]
      }
    ]
  },
  resolve: {
    modules: [
      'src',
      'node_modules'
    ]
  }
}
