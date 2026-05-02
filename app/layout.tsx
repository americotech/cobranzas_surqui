import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Cobranzas',
  description: 'Gestor de cobros',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const today = new Date().toLocaleDateString('es-PE', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  return (
    <html lang="es">
      <body>
        <div className="app-shell">
          {/* Sidebar */}
          <aside className="sidebar">
            <div className="sidebar-logo">
              <span className="icon">🏠</span>
              Cobranzas
            </div>
            <nav className="sidebar-nav">
              <span className="nav-label">Principal</span>
              <a href="/dashboard" className="nav-link">
                <span className="nav-icon">📊</span>
                Dashboard
              </a>
              <span className="nav-label">Gestión</span>
              <a href="/pagos/nuevo" className="nav-link">
                <span className="nav-icon">💳</span>
                Registrar Pago
              </a>
              <a href="/pagos" className="nav-link">
                <span className="nav-icon">📋</span>
                Historial de Pagos
              </a>
              <a href="/contratos" className="nav-link">
                <span className="nav-icon">📄</span>
                Contratos
              </a>
              <a href="/inquilinos" className="nav-link">
                <span className="nav-icon">👤</span>
                Inquilinos
              </a>
              <a href="/inmuebles" className="nav-link">
                <span className="nav-icon">🏢</span>
                Inmuebles
              </a>
            </nav>
          </aside>

          {/* Main */}
          <div className="main-content">
            <header className="topbar">
              <span className="topbar-title">Gestor de Cobros de Alquileres</span>
              <span className="topbar-date">{today}</span>
            </header>
            <main className="page-body">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  )
}
