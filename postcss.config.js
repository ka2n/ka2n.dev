const cssBuild = process.env.CSS_ENV === "build";

const plugins = [
  [
    "tailwindcss",
    {
      purge: {
        enabled: true,
        content: ["./components/**/*.tsx", "./pages/**/*.tsx"],
      },
      theme: {
        extend: {},
      },
      variants: {},
      plugins: [],
    },
  ],
  "postcss-preset-env",
  ["cssnano", { preset: "default" }],
];

module.exports = {
  plugins: cssBuild
    ? plugins.map((plugin) => {
        if (typeof plugin === "string") {
          return require(plugin);
        } else {
          return require(plugin[0])(plugin[1]);
        }
      })
    : plugins,
};
