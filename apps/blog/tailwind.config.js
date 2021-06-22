module.exports = {
  purge: ["./components/**/*.tsx", "./pages/**/*.tsx"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Helvetica Neue",
          "Segoe UI",
          "Hiragino Kaku Gothic ProN",
          "Hiragino Sans",
          "ヒラギノ角ゴ ProN W3",
          "Arial",
          "メイリオ",
          "Meiryo",
          "sans-serif",
        ],
        serif: ["Georgia", "Cambria", '"Times New Roman"', "Times", "serif"],
        mono: [
          "Menlo",
          "Monaco",
          "Consolas",
          '"Liberation Mono"',
          '"Courier New"',
          "monospace",
        ],
      },
      spacing: {
        72: "18rem",
        84: "21rem",
        96: "24rem",
        side: "240px",
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [require("@neojp/tailwindcss-line-clamp-utilities")],
};
