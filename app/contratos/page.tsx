import { prisma } from '@/lib/prisma'

function fmtFecha(d: Date | null) {
  if (!d) return '—'
  return new Date(d.getTime() + d.getTimezoneOffset() * 60_000)
    .toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default async function ContratosPage() {
  const contratos = await prisma.contrato.findMany({
    include: { inmueble: true, inquilino: true },
    orderBy: [{ estado: 'asc' }, { inmueble: { nombre: 'asc' } }],
  })

  const activos   = contratos.filter(c => c.estado === 'activo').length
  const inactivos = contratos.filter(c => c.estado !== 'activo').length
  const totalRenta = contratos
    .filter(c => c.estado === 'activo')
    .reduce((sum, c) => sum + Number(c.montoRenta), 0)

  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Contratos</h1>
          <p>{contratos.length} contratos registrados</p>
        </div>
        <a href="/contratos/nuevo" className="btn btn-primary">
          + Nuevo Contrato
        </a>
      </div>

      <div className="stat-grid" style={{ marginBottom: 28 }}>
        <div className="stat-card blue">
          <span className="stat-label">Total Contratos</span>
          <span className="stat-value">{contratos.length}</span>
        </div>
        <div className="stat-card green">
          <span className="stat-label">Activos</span>
          <span className="stat-value green">{activos}</span>
        </div>
        <div className="stat-card indigo">
          <span className="stat-label">Renta Mensual Total</span>
          <span className="stat-value blue" style={{ fontSize: '1.4rem' }}>S/ {totalRenta.toFixed(2)}</span>
        </div>
        <div className="stat-card red">
          <span className="stat-label">Inactivos</span>
          <span className="stat-value red">{inactivos}</span>
        </div>
      </div>

      <div className="table-card">
        <div className="table-header">
          <h2>Todos los contratos</h2>
        </div>
        <table>
          <thead>
            <tr>
              <th>Inmueble</th>
              <th>Inquilino</th>
              <th>Renta</th>
              <th>Día Venc.</th>
              <th>Inicio</th>
              <th>Fin</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {contratos.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', color: '#94a3b8', padding: '40px' }}>
                  Sin contratos registrados
                </td>
              </tr>
            ) : (
              contratos.map(c => (
                <tr key={String(c.id)}>
                  <td style={{ fontWeight: 600 }}>{c.inmueble.nombre}</td>
                  <td>{c.inquilino?.nombre ?? <span style={{ color: '#94a3b8' }}>Sin inquilino</span>}</td>
                  <td style={{ fontWeight: 600 }}>S/ {Number(c.montoRenta).toFixed(2)}</td>
                  <td style={{ textAlign: 'center' }}>Día {c.diaVencimiento}</td>
                  <td>{fmtFecha(c.fechaInicio)}</td>
                  <td>{fmtFecha(c.fechaFin)}</td>
                  <td>
                    {c.estado === 'activo'
                      ? <span className="badge badge-green">Activo</span>
                      : <span className="badge badge-red">Inactivo</span>
                    }
                  </td>
                  <td>
                    <a
                      href={`/contratos/${c.id}/editar`}
                      className="btn btn-secondary"
                      style={{ padding: '4px 12px', fontSize: '0.78rem' }}
                    >
                      Editar
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
