/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
        "./public/index.html"
    ],
    safelist: [
        {
            pattern: /(bg|text|border)-(blue|purple|rose|emerald|amber|cyan)-(100|400|500|600)/,
            variants: ['hover', 'dark'],
        },
    ],
    theme: {
        extend: {},
    },
    plugins: [],
}
