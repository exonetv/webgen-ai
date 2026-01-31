/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // On ajoute ces lignes pour qu'il cherche dans le dossier 'app' à la racine
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",

    // On garde celui-ci au cas où tu créerais un dossier src plus tard
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};