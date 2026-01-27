/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'uk-navy': {
          50: '#e6f0ff',
          100: '#b3d1ff',
          200: '#80b3ff',
          300: '#4d94ff',
          400: '#1a75ff',
          500: '#001f4d',  // Primary dark navy
          600: '#001840',
          700: '#001133',
          800: '#000b26',
          900: '#000419',
        },
        'uk-red': {
          50: '#ffe6e6',
          100: '#ffb3b3',
          200: '#ff8080',
          300: '#ff4d4d',
          400: '#ff1a1a',
          500: '#c8102e',  // Primary UK red
          600: '#a00d25',
          700: '#780a1c',
          800: '#500613',
          900: '#28030a',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'uk-gradient': 'linear-gradient(135deg, #001f4d 0%, #c8102e 100%)',
      },
    },
  },
  plugins: [],
}



