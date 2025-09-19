/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./public/index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  important: "#root",              // <- critical when using MUI/Emotion
  theme: { extend: {} },
  // If the form controls jump, either disable Preflight OR use @tailwindcss/forms (see step 4)
  // corePlugins: { preflight: false },
  plugins: [],
  safelist: [
    // add any class names you generate dynamically with template strings
  ],
};
