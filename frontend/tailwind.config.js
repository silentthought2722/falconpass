/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cyberpunk color palette
        neon: {
          cyan: '#00FFFF',
          'cyan-dark': '#00E5FF',
          pink: '#FF0080',
          'pink-dark': '#FF1493',
          green: '#00FF00',
          'green-dark': '#39FF14',
          purple: '#8A2BE2',
          'purple-dark': '#9932CC',
        },
        cyber: {
          black: '#0A0A0A',
          'dark-gray': '#1A1A1A',
          'medium-gray': '#2A2A2A',
          'light-gray': '#3A3A3A',
          'text-primary': '#FFFFFF',
          'text-secondary': '#E0FFFF',
          'text-accent': '#00FFFF',
        },
        primary: {
          50: '#f0ffff',
          100: '#e0ffff',
          200: '#b3ffff',
          300: '#80ffff',
          400: '#4dffff',
          500: '#00FFFF',
          600: '#00e5e5',
          700: '#00cccc',
          800: '#00b3b3',
          900: '#009999',
          950: '#006666',
        },
        secondary: {
          50: '#fff0f8',
          100: '#ffe0f0',
          200: '#ffb3d9',
          300: '#ff80c2',
          400: '#ff4dab',
          500: '#FF0080',
          600: '#e60073',
          700: '#cc0066',
          800: '#b30059',
          900: '#99004d',
          950: '#660033',
        },
      },
      fontFamily: {
        'cyber': ['Orbitron', 'monospace'],
        'mono': ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'pulse-neon': 'pulse-neon 1.5s ease-in-out infinite',
        'scan': 'scan 2s linear infinite',
        'flicker': 'flicker 0.15s infinite linear',
      },
      keyframes: {
        glow: {
          '0%': { 
            boxShadow: '0 0 5px #00FFFF, 0 0 10px #00FFFF, 0 0 15px #00FFFF',
          },
          '100%': { 
            boxShadow: '0 0 10px #00FFFF, 0 0 20px #00FFFF, 0 0 30px #00FFFF',
          },
        },
        'pulse-neon': {
          '0%, 100%': { 
            opacity: '1',
            textShadow: '0 0 5px #00FFFF, 0 0 10px #00FFFF, 0 0 15px #00FFFF',
          },
          '50%': { 
            opacity: '0.8',
            textShadow: '0 0 10px #00FFFF, 0 0 20px #00FFFF, 0 0 30px #00FFFF',
          },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        flicker: {
          '0%, 19.999%, 22%, 62.999%, 64%, 64.999%, 70%, 100%': {
            opacity: '1',
          },
          '20%, 21.999%, 63%, 63.999%, 65%, 69.999%': {
            opacity: '0.4',
          },
        },
      },
      backgroundImage: {
        'cyber-grid': 'linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)',
        'cyber-gradient': 'linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 50%, #2A2A2A 100%)',
        'neon-gradient': 'linear-gradient(45deg, #00FFFF, #FF0080, #00FF00)',
      },
    },
  },
  plugins: [],
}