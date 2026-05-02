import { prisma } from '@/lib/prisma'

// Las fechas en Neon se almacenan con offset local (UTC-5),
// se usa UTC para evitar que se reste un día al mostrar.
function fmtFecha(d: Date) {
  return new Date(d.getTime() + d.getTimezoneOffset() * 60_000)
    .toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default async function Dashboard() {
  // Filtrar por rango del mes para evitar problemas de timezone
  const inicioMes = new Date(Date.UTC(2026, 3, 1))
  const finMes    = new Date(Date.UTC(2026, 4, 1))

  // Traer todos los pagos de abril y normalizarlos por contrato/mes
  const pagosAbril = await prisma.pago.findMany({
    where: { periodo: { gte: inicioMes, lt: finMes } },
    include: {
      contrato: { include: { inmueble: true, inquilino: true } }
    },
    orderBy: { fechaVencimiento: 'asc' }
  })

  const grupos = new Map<string, typeof pagosAbril>()

  for (const pago of pagosAbril) {
    const key = `${pago.contratoId.toString()}-${pago.periodo.toISOString().slice(0, 7)}`
    const arr = grupos.get(key)
    if (arr) {
      arr.push(pago)
    } else {
      grupos.set(key, [pago])
    }
  }

  const registrosNormalizados = Array.from(grupos.values()).map((grupo) => {
    const pagado = grupo.find((p) => p.fechaPagoReal !== null)
    return pagado ?? grupo[0]
  })

  const cobrado = registrosNormalizados
    .filter((p) => p.montoPagado !== null)
    .reduce((sum, p) => sum + Number(p.montoPagado), 0)

  const esperado = registrosNormalizados
    .reduce((sum, p) => sum + Number(p.montoEsperado), 0)

  const porcentaje = esperado > 0 ? Math.round((cobrado / esperado) * 100) : 0

  const morosos = registrosNormalizados.filter((p) => p.fechaPagoReal === null)

  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Dashboard</h1>
          <p>Resumen del período — Abril 2026</p>
        </div>
        <a href="/pagos/nuevo" className="btn btn-primary">
          + Registrar Pago
        </a>
      </div>

      <div className="stat-grid">
        <div className="stat-card blue">
          <span className="stat-label">Esperado Abril</span>
          <span className="stat-value">S/ {esperado.toFixed(2)}</span>
        </div>
        <div className="stat-card green">
          <span className="stat-label">Recaudado</span>
          <span className="stat-value green">S/ {cobrado.toFixed(2)}</span>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${porcentaje}%` }} />
          </div>
        </div>
        <div className="stat-card indigo">
          <span className="stat-label">% Cobrado</span>
          <span className="stat-value blue">{porcentaje}%</span>
        </div>
        <div className="stat-card red">
          <span className="stat-label">En mora / pendiente</span>
          <span className="stat-value red">{morosos.length}</span>
        </div>
      </div>

      <div className="table-card">
        <div className="table-header">
          <h2>Inmuebles con retraso o pendiente — Abril 2026</h2>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{morosos.length} registros</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>Inmueble</th>
              <th>Inquilino</th>
              <th>Vencimiento</th>
              <th>Estado</th>
              <th>Monto</th>
            </tr>
          </thead>
          <tbody>
            {morosos.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', color: '#94a3b8', padding: '40px' }}>
                  Sin pendientes este mes
                </td>
              </tr>
            ) : (
              morosos.map((pago) => (
                <tr key={String(pago.id)}>
                  <td style={{ fontWeight: 600 }}>{pago.contrato.inmueble.nombre}</td>
                  <td>{pago.contrato.inquilino?.nombre ?? '—'}</td>
                  <td>{fmtFecha(pago.fechaVencimiento)}</td>
                  <td>
                    {pago.fechaPagoReal === null ? (
                      <span className="badge badge-red">Pendiente</span>
                    ) : (
                      <span className="badge badge-orange">Con retraso</span>
                    )}
                  </td>
                  <td style={{ fontWeight: 600 }}>S/ {pago.montoEsperado.toString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
