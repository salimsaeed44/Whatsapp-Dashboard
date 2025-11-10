/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        'whatsapp': {
          'dark-bg': '#0b141a',
          'dark-panel': '#111b21',
          'dark-hover': '#202c33',
          'green': '#00a884',
          'green-dark': '#008069',
          'text-primary': '#e9edef',
          'text-secondary': '#8696a0',
          'text-tertiary': '#667781',
          'message-sent': '#005c4b',
          'message-received': '#202c33',
          'input-bg': '#2a3942',
          'border': '#313d45',
        },
      },
    },
  },
  plugins: [],
}

