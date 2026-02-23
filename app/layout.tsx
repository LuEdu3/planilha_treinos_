import type { Metadata } from 'next'
import './globals.css'
import { LayoutWithOffcanvas } from '@/components/LayoutWithOffcanvas'

export const metadata: Metadata = {
  title: 'Planilha Progressão de Carga',
  description: 'Controle de progressão de carga na academia — aquecimento, preparação e séries válidas',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-primary-50 text-primary-900">
        <LayoutWithOffcanvas>{children}</LayoutWithOffcanvas>
      </body>
    </html>
  )
}
