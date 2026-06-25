/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#9A5ABF',
        'primary-strong': '#681993',
        'primary-heavy': '#4E1370',
      },
      fontFamily: {
        sans: ['Wanted Sans', 'Pretendard', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        btn: '12px',
        card: '15px',
        'card-lg': '18px',
        sheet: '22px',
      },
      transitionTimingFunction: {
        standard: 'cubic-bezier(.4,0,.2,1)',
        emphasized: 'cubic-bezier(.2,0,0,1)',
      },
      keyframes: {
        dbfade: { from: { transform: 'translateY(8px)' }, to: { transform: 'none' } },
        dbspin: { to: { transform: 'rotate(360deg)' } },
        dbpulse: { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.35 } },
      },
      animation: {
        dbfade: 'dbfade .3s cubic-bezier(.4,0,.2,1) both',
        dbspin: 'dbspin 1s linear infinite',
        dbpulse: 'dbpulse 1s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
