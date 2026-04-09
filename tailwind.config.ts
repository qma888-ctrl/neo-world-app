import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Cyberpunk NEO Universe theme
        'neon-cyan': '#00f0ff',
        'neon-magenta': '#ff00ff',
        'neon-pink': '#ff006e',
        'neon-purple': '#b300ff',
        'neon-green': '#39ff14',
        'dark-bg': '#0a0e27',
        'dark-surface': '#151b2f',
        'dark-elevated': '#1f2940',
      },
      backgroundImage: {
        'gradient-neon': 'linear-gradient(135deg, #00f0ff 0%, #b300ff 100%)',
        'gradient-dark': 'linear-gradient(135deg, #0a0e27 0%, #151b2f 100%)',
      },
      boxShadow: {
        'neon-glow': '0 0 20px rgba(0, 240, 255, 0.5)',
        'neon-glow-pink': '0 0 20px rgba(255, 0, 110, 0.5)',
        'neon-glow-purple': '0 0 20px rgba(179, 0, 255, 0.5)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'flicker': 'flicker 2s infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'flicker': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.95' },
        },
      },
    },
  },
  plugins: [],
}
export default config
