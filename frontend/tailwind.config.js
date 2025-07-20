// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        bamboo: {
          green: "#5BA14C",
          tan: "#F2E5C0",
        },
        primary: "#5BA14C", // bamboo green
        secondary: "#F2E5C0", // bamboo tan
        accent: "#264d2c", // deep bamboo green
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
