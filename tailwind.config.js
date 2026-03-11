/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // 墨 (Sumi) カラーパレット
        ink: {
          DEFAULT: '#1a1208',
          light: '#3d2b1f',
          muted: '#6b5744',
        },
        paper: {
          DEFAULT: '#f5ede0',
          dark: '#e8ddd0',
          darker: '#d6c9b8',
        },
        vermillion: {
          DEFAULT: '#c73b2a',
          light: '#e05544',
          dark: '#9e2e20',
        },
        ash: {
          DEFAULT: '#8c7b6e',
          light: '#b0a398',
          dark: '#5e5048',
        },
        // ダークモード用
        night: {
          DEFAULT: '#0f0d0a',
          surface: '#1c1813',
          raised: '#262118',
          border: '#3a3028',
        },
      },
      fontFamily: {
        mincho: ['"Shippori Mincho"', '"游明朝"', '"Yu Mincho"', '"Hiragino Mincho ProN"', 'serif'],
        gothic: ['"Zen Kaku Gothic New"', '"游ゴシック"', '"Yu Gothic"', 'sans-serif'],
        mono: ['"Zen Kurenaido"', '"Courier New"', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'ink-spread': 'inkSpread 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        inkSpread: {
          from: { opacity: '0', transform: 'scale(0.97)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
