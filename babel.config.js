const babelCfg = {
  'useBuiltIns': 'entry',
  'modules': false
}

module.exports = function babelConfig (api) {
  api.cache(true)
  return {
    'plugins': [
      'lodash',
      '@babel/plugin-transform-runtime',
      '@babel/plugin-proposal-class-properties'
    ],
    'presets': [
      ['@babel/preset-env', babelCfg]
    ],
    'env': {
      'test': {
        'presets': [
          ['@babel/preset-env', babelCfg]
        ]
      }
    }
  }
}
