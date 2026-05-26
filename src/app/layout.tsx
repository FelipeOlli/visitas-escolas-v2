import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Controle de Visitas — Escolas RJ',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-zinc-50 text-zinc-900 antialiased">{children}</body>
    </html>
  )
}
