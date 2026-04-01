/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            colors: {
                brand: {
                    50: '#f0f9ff',
                    100: '#e0f3fe',
                    200: '#bae6fd',
                    300: '#7dd3fc',
                    400: '#38bdf8',
                    500: '#0ea5e9',
                    600: '#0284c7',
                    700: '#0369a1',
                    800: '#075985',
                    900: '#0c4a6e',
                    950: '#082f49',
                },
                sit: {
                    dark: '#02272F',
                    orange: '#FE5823',
                    'half-baked': '#8AC4C7',
                    yellow: '#EEBE41',
                    'light-blue': '#CFDFDC',
                    'light-yellow': '#EAE4D2',
                }
            }
        },
    },
    plugins: [],
}
