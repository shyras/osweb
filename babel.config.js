module.exports = function babelConfig (api) {
  api.cache(true)
  return {
    plugins: [
      'lodash',
      '@babel/plugin-transform-runtime',
      '@babel/plugin-proposal-class-properties'
    ],
    presets: [
      ['@babel/preset-env', {
        useBuiltIns: 'usage',
        corejs: 3,
        modules: false
      }]
    ],
    env: {
      test: {
        presets: [
          '@babel/preset-env'
        ]
      }
    }
  }
}
