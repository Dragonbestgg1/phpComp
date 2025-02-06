module.exports = {
    parser: '@typescript-eslint/parser',
    extends: [
      'plugin:@typescript-eslint/recommended',
      'next/core-web-vitals',
    ],
    rules: {
      '@typescript-eslint/no-unused-vars': ['off'],
    },
  };
  