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
      spacing: {
        // 콘텐츠 좌우 기본 여백. px-content / p-content 가 이 값을 사용한다.
        content: '20px',
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
        screenIn: { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'none' } },
        cardIn: { from: { opacity: 0, transform: 'translateY(10px)' }, to: { opacity: 1, transform: 'none' } },
        fabPulse: { from: { transform: 'scale(1)', opacity: 0.35 }, to: { transform: 'scale(1.8)', opacity: 0 } },
      },
      animation: {
        dbfade: 'dbfade .3s cubic-bezier(.4,0,.2,1) both',
        dbspin: 'dbspin 1s linear infinite',
        dbpulse: 'dbpulse 1s ease-in-out infinite',
        screenIn: 'screenIn .34s cubic-bezier(.2,0,0,1) both',
        cardIn: 'cardIn .4s cubic-bezier(.2,0,0,1) both',
        fabPulse: 'fabPulse 2s ease-out infinite',
      },
    },
  },
  plugins: [],
}
