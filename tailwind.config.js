/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'core-bg': '#050509',
        'panel-bg': '#0d0d1a',
        'card-bg': '#121225',
        'primary': '#7c3aed',
        'secondary': '#db2777',
        'text-muted': '#94a3b8',
        'success': '#10b981',
      },
      fontFamily: {
        'general': ['General Sans', 'sans-serif'],
        'satoshi': ['Satoshi', 'sans-serif'],
      },
      boxShadow: {
        'nm-flat': '6px 6px 16px rgba(0, 0, 0, 0.45), -4px -4px 10px rgba(255, 255, 255, 0.02)',
        'nm-inset': 'inset 4px 4px 8px rgba(0, 0, 0, 0.5), inset -2px -2px 6px rgba(255, 255, 255, 0.02)',
        'glow-purple': '0 0 20px rgba(124, 58, 237, 0.4)',
        'glow-pink': '0 0 20px rgba(219, 39, 119, 0.4)',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      letterSpacing: {
        'tech': '0.3em',
        'tech-sm': '0.15em',
        'btn': '0.4em',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'spin-slow': 'spin 1s linear infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(16, 185, 129, 0.4)' },
          '50%': { boxShadow: '0 0 20px rgba(16, 185, 129, 0.8)' },
        },
      },
    },
  },
  plugins: [],
}
