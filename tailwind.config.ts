import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        status: {
          pendente:   '#C62828',
          visitado:   '#2E7D32',
          tentativa:  '#F57F17',
          reagendado: '#6A1B9A',
        },
      },
    },
  },
  plugins: [],
}

export default config
