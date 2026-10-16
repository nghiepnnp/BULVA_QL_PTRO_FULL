/** @type {import('tailwindcss').Config} */
// Exact palette extracted from mobile_mvp_prototype(1).html.
// This JSON is also imported by src/components/ui/theme.ts.
const colors = require("./design-tokens.json");
module.exports = {
  content: ["./src/**/*.{ts,tsx,js,jsx}"],
  presets: [require("nativewind/preset")],
  theme: { extend: { colors: Object.fromEntries(Object.keys(colors).map(key => [key, `rgb(var(--color-${key}) / <alpha-value>)`])) } },
  plugins: [],
};
