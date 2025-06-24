module.exports = {
    env: {
        browser: true,
        es2021: true,
        node: true
    },
    extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended'
    ],
    parserOptions: {
        ecmaFeatures: {
            jsx: true
        },
        ecmaVersion: 12,
        sourceType: 'module'
    },
    plugins: [
        'react',
        'react-hooks'
    ],
    rules: {
        // 'indent': ['error', 4],
        'linebreak-style': 'off',
        'semi': ['error', 'always'],
        'no-unused-vars': 'warn',
        'no-console': 'off',
        'eol-last': 'off',
        'no-var': 'error',
        'prefer-const': 'error',
        'arrow-spacing': 'error',
        'no-duplicate-imports': 'error',
        'no-useless-constructor': 'error',
        'no-unused-expressions': 'error',
        'react/prop-types': 'off',
        'react/react-in-jsx-scope': 'off',
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'warn'
    },
    settings: {
        react: {
            version: 'detect'
        }
    }
}; 