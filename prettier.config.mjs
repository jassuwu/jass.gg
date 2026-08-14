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
  // Tailwind 4 is CSS-first: the class sorter can't resolve @theme tokens
  // without being pointed at the stylesheet that defines them. Omit this and
  // sorting silently no-ops.
  tailwindStylesheet: "./src/styles/global.css",
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
