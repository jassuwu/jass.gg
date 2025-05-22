const config = {
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  bracketSameLine: true,
  trailingComma: "all",
  semi: true,
  endOfLine: "lf",
  arrowParens: "always",
  singleQuote: false,
  jsxSingleQuote: false,
  plugins: ["prettier-plugin-astro", "prettier-plugin-tailwindcss"],
  overrides: [
    {
      files: "*.astro",
      options: {
        parser: "astro",
      },
    },
  ],
};

export default config;
