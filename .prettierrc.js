/** @type {import("prettier").Config} */

const config = {
  trailingComma: 'all',
  singleQuote: true,
  printWidth: 180,
  tabWidth: 2,
  semi: false,
  overrides: [
    {
      files: '*.tsx',
      options: {
        printWidth: 90,
      },
    },
  ],
}

module.exports = config
