const cssBuild = process.env.CSS_ENV === "build";

const plugins = [
  [
    "tailwindcss",
    {
      purge: {
        enabled: process.env.NODE_ENV === "production",
        content: ["./components/**/*.tsx", "./pages/**/*.tsx"],
      },
      theme: {
        extend: {
          spacing: {
            "72": "18rem",
            "84": "21rem",
            "96": "24rem",
            side: "240px",
          },
        },
      },
      variants: {},
      plugins: [require("@neojp/tailwindcss-line-clamp-utilities")],
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
