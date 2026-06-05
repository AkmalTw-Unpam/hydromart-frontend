/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#f0fdfb', 100: '#ccfbf4', 200: '#99f5ea',
          300: '#5deadd', 400: '#2dd4cb', 500: '#0abfbc',
          600: '#089e9b', 700: '#077e7c', 800: '#086463',
          900: '#0a5251', 950: '#042e2e',
        },
        navy: {
          50:  '#f0f4f8', 100: '#d9e2ec', 200: '#bcccdc',
          300: '#9fb3c8', 400: '#829ab1', 500: '#627d98',
          600: '#486581', 700: '#334e68', 800: '#243b53',
          900: '#102a43', 950: '#0b1b2b',
        },
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      borderRadius: { '2xl': '1rem', '3xl': '1.5rem' },
      animation: {
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        slideInRight: { from: { transform: 'translateX(100%)', opacity: '0' }, to: { transform: 'translateX(0)', opacity: '1' } },
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        scaleIn: { from: { transform: 'scale(0.95)', opacity: '0' }, to: { transform: 'scale(1)', opacity: '1' } },
      },
      backdropBlur: { xs: '2px' },
    },
  },
  plugins: [],
}
