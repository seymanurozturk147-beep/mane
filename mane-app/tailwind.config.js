/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/renderer/index.html',
    './src/renderer/src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: '#FCF7F1',
          medium: '#F5EDE0',
          dark: '#EDE0CC',
        },
        orange: {
          DEFAULT: '#F4A261',
          dark: '#E76F51',
          light: '#FDDCB5',
          pale: '#FFF3E8',
        },
        brown: {
          DEFAULT: '#4A3728',
          light: '#7C5C45',
        },
        card: '#FFFFFF',
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        soft: '0 4px 24px 0 rgba(244, 162, 97, 0.12)',
        card: '0 2px 20px 0 rgba(74, 55, 40, 0.08)',
        btn: '0 4px 16px 0 rgba(231, 111, 81, 0.30)',
      },
      backgroundImage: {
        'warm-gradient': 'radial-gradient(ellipse at top right, #FFF3E8 0%, #FCF7F1 60%, #F5EDE0 100%)',
      },
    },
  },
  plugins: [],
}
