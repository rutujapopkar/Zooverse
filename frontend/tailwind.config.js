/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: { '2xl': '1320px' }
    },
    extend: {
      colors: {
        bg: {
          DEFAULT: '#090d0b',
          alt: '#111714'
        },
        surface: {
          DEFAULT: '#141b18',
          raised: '#1b2420',
          hover: '#222d27'
        },
        lightbg: {
          DEFAULT: '#f8faf9',
          alt: '#eef3f1'
        },
        lightsurface: {
          DEFAULT: '#ffffff',
          raised: '#f1f5f3',
          hover: '#e8efec'
        },
        border: {
            subtle: '#1e2723',
            DEFAULT: '#2b3631',
            strong: '#3a4741'
        },
        accent: {
          DEFAULT: '#18b078',
          soft: '#22c58e',
          fg: '#d0ffee'
        },
        danger: { DEFAULT:'#dc4338', fg:'#ffe9e7' },
        warn: { DEFAULT:'#d4931a', fg:'#fff5e1' },
        info: { DEFAULT:'#1d7dd8', fg:'#e0f1ff' },
        success: { DEFAULT:'#199b55', fg:'#d6ffe9' }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif']
      },
      spacing: {
        'safe': 'env(safe-area-inset-top)',
        'header': '4.25rem'
      },
      borderRadius: {
        'xs':'3px',
        'sm':'6px',
        'md':'10px',
        'lg':'14px',
        'xl':'20px'
      },
      boxShadow: {
        'soft': '0 2px 4px -1px rgba(0,0,0,.4), 0 4px 18px -4px rgba(0,0,0,.35)',
        'focus': '0 0 0 3px rgba(34,197,94,.35)'
      },
      zIndex: {
        'overlay': '60',
        'toast': '70',
        'modal': '80',
        'popover':'90'
      },
      keyframes: {
        'hero-fade': {
          '0%': { opacity: 0, transform: 'translateY(24px) scale(.97)' },
          '60%': { opacity: 1 },
          '100%': { opacity: 1, transform: 'translateY(0) scale(1)' }
        },
        'fade-up': {
          '0%': { opacity:0, transform:'translateY(12px)' },
          '100%': { opacity:1, transform:'translateY(0)' }
        },
        'ken-burns': {
          '0%': { transform: 'scale(1) translate3d(0,0,0)' },
          '100%': { transform: 'scale(1.15) translate3d(2%,2%,0)' }
        },
        'fade-cross': {
          '0%': { opacity:0 },
          '100%': { opacity:1 }
        }
      },
      animation: {
        'hero-fade': 'hero-fade 1s cubic-bezier(.16,.84,.44,1) forwards',
        'fade-up': 'fade-up .6s ease both',
        'ken-burns': 'ken-burns 18s ease-in-out forwards',
        'fade-cross': 'fade-cross 1.4s ease-in-out'
      }
    }
  },
  plugins: []
}
