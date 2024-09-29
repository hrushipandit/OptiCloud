// tailwind.config.js
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}", // Scan files in the pages folder
    "./src/app/**/*.{js,ts,jsx,tsx}", // If using app router
    "./src/components/**/*.{js,ts,jsx,tsx}", // Scan components folder if applicable
    "./src/styles/**/*.{js,ts,jsx,tsx}", // In case you have any utility CSS in styles folder
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
