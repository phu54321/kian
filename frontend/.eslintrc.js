module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    node: true,
    mocha: true
  },
  extends: [
    'eslint-config-standard',
    'plugin:vue/essential'
  ],
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: 'typescript-eslint-parser',
    plugins: ['typescript'],
    ecmaVersion: 2017,
    sourceType: 'module'
  },
  plugins: ['vue']
}
