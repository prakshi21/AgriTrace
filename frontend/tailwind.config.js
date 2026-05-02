/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FFFDF9',
          100: '#FDF8F3',
          200: '#F7EFDF',
          300: '#EDE2CC',
        },
        brand: {
          50: '#F4F9F0',
          100: '#E2F0D5',
          200: '#C5DEB0',
          300: '#9EC47E',
          400: '#6FA34E',
          500: '#4D7C2A',
          600: '#3D6621',
          700: '#2F4F1A',
          800: '#243D14',
          900: '#1A2E0F',
        },
        bark: {
          50: '#FAF5F0',
          100: '#F0E6D8',
          200: '#DCC8AA',
          300: '#C4A57A',
          400: '#A6804F',
          500: '#8B6A3F',
          600: '#6B4F2D',
          700: '#4A3820',
          800: '#3B2D19',
          900: '#2C2114',
        },
        earth: {
          50: '#F8F5F0',
          100: '#EDE7DC',
          200: '#DDD3C2',
          300: '#C5B89F',
          400: '#A89878',
          500: '#8A7A5B',
          600: '#6E6249',
        },
      },
      fontFamily: {
        serif: ['"DM Serif Display"', 'Georgia', 'serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out both',
        'slide-up': 'slideUp 0.5s ease-out both',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
}
