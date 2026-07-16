module.exports = {
  root: true,
  env: {
    browser: true,
    es6: true,
    node: true
  },
  extends: ["eslint:recommended"],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module"
  },
  rules: {
    "no-debugger": "error",
    "no-console": "off",
    "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }]
  },
  overrides: [
    {
      files: ["src/**/*.vue"],
      parser: "vue-eslint-parser",
      parserOptions: {
        parser: "babel-eslint"
      },
      extends: ["plugin:vue/essential"],
      rules: {
        "vue/no-unused-vars": "warn"
      }
    }
  ]
};
