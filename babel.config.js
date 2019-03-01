module.exports = function babelConfig (api) {
  api.cache(true)
  return {
    'plugins': [
      'lodash',
      '@babel/plugin-transform-runtime'
    ],
    'presets': [
      ['@babel/preset-env', {
        'modules': false
      }]
    ],
    'env': {
      'test': {
        'presets': [
          '@babel/preset-env'
        ]
      }
    }
  }
}
