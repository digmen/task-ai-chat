import type { Config } from 'tailwindcss'

export default <Config>{
  content: [
    './app.vue',
    './pages/**/*.{vue,js,ts}',
    './layouts/**/*.{vue,js,ts}',
    './components/**/*.{vue,js,ts}',
    './app/**/*.{vue,js,ts}'
  ],
  theme: {
    extend: {
      colors: {
        mantis: {
          dark: '#072E6A',
          light: '#F2F4F7',
          primary: '#3B82F6',
          sidebar: '#05224D',
          input: '#0A3A80'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    }
  },
  plugins: [],
}