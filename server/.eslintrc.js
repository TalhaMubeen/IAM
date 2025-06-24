module.exports = {
    env: {
        node: true,
        es2021: true,
        jest: true
    },
    extends: [
        'eslint:recommended'
    ],
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
    },
    rules: {
        'indent': ['error', 4],
        'linebreak-style': 'off',
        'semi': ['error', 'always'],
        'no-unused-vars': ['warn'],
        'no-console': 'off',
        'eol-last': 'off',
        'no-var': 'error',
        'prefer-const': 'error',
        'comma-dangle': ['error', 'never'],
        'arrow-spacing': 'error',
        'no-duplicate-imports': 'error',
        'no-useless-constructor': 'error',
        'no-unused-expressions': 'error'
    }
};