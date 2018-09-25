const path = require('path');

module.exports = {
    "env": {
        "browser": true,
        "commonjs": true,
        "es6": true,
        "node": true,
        "mocha": true,
    },
    "extends": [
        "es2015",
        "eslint:recommended",
        'plugin:vue/essential',
    ],
    "parserOptions": {
        "parser": "typescript-eslint-parser",
        "plugins": ["typescript"],
        "ecmaVersion": 2017,
        "sourceType": "module"
    },
    "rules": {
        "space-before-function-paren": ["error", "always"],
        "indent": [
            "error",
            4
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "always"
        ],
        "eqeqeq": [
            "error",
            "always"
        ],
        "no-constant-condition": [
            "error",
            { "checkLoops": false }
        ],
        "object-curly-spacing": ["error", "always"],
        "keyword-spacing": ["error", {
            "before": true,
            "after": true,
        }],
        "comma-dangle": ["error", "always-multiline"],
        "no-undef": "off",
        "no-unused-vars": "off",
    }
};
