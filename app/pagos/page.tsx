import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { BtnEliminarPago } from './BtnEliminarPago'

async function eliminarPago(formData: FormData) {
  'use server'
  const id = BigInt(formData.get('id') as string)
  await prisma.pago.delete({ where: { id } })
  revalidatePath('/pagos')
  revalidatePath('/dashboard')
}

function fmtFecha(d: Date | null) {
  if (!d) return '—'
  return new Date(d.getTime() + d.getTimezoneOffset() * 60_000)
    .toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function fmtMes(d: Date) {
  return new Date(d.getTime() + d.getTimezoneOffset() * 60_000)
    .toLocaleDateString('es-PE', { month: 'long', year: 'numeric' })
}

export default async function HistorialPagos() {
  const pagos = await prisma.pago.findMany({
    include: {
      contrato: { include: { inmueble: true, inquilino: true } }
    },
    orderBy: [{ periodo: 'desc' }, { fechaVencimiento: 'asc' }]
  })

  const totalCobrado = pagos
    .filter(p => p.montoPagado !== null)
    .reduce((sum, p) => sum + Number(p.montoPagado), 0)

  const pendientes  = pagos.filter(p => p.fechaPagoReal === null).length
  const conRetraso  = pagos.filter(p => p.fechaPagoReal !== null && p.fechaPagoReal > p.fechaVencimiento).length
  const alDia       = pagos.filter(p => p.fechaPagoReal !== null && p.fechaPagoReal <= p.fechaVencimiento).length

  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Historial de Pagos</h1>
          <p>{pagos.length} registros en total</p>
        </div>
        <a href="/pagos/nuevo" className="btn btn-primary">
          + Registrar Pago
        </a>
      </div>

      {/* Resumen */}
      <div className="stat-grid" style={{ marginBottom: 28 }}>
        <div className="stat-card blue">
          <span className="stat-label">Total Registros</span>
          <span className="stat-value">{pagos.length}</span>
        </div>
        <div className="stat-card green">
          <span className="stat-label">Total Cobrado</span>
          <span className="stat-value green">S/ {totalCobrado.toFixed(2)}</span>
        </div>
        <div className="stat-card indigo">
          <span className="stat-label">Pagados a tiempo</span>
          <span className="stat-value blue">{alDia}</span>
        </div>
        <div className="stat-card red">
          <span className="stat-label">Pendientes</span>
          <span className="stat-value red">{pendientes}</span>
        </div>
      </div>

      {/* Tabla */}
      <div className="table-card">
        <div className="table-header">
          <h2>Todos los pagos</h2>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{conRetraso} con retraso</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>Período</th>
              <th>Inmueble</th>
              <th>Inquilino</th>
              <th>Vencimiento</th>
              <th>Fecha de Pago</th>
              <th>Método</th>
              <th>Estado</th>
              <th>Monto</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {pagos.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', color: '#94a3b8', padding: '40px' }}>
                  Sin registros
                </td>
              </tr>
            ) : (
              pagos.map(p => {
                const esPendiente  = p.fechaPagoReal === null
                const esConRetraso = !esPendiente && p.fechaPagoReal! > p.fechaVencimiento
                const esAlDia      = !esPendiente && !esConRetraso

                return (
                  <tr key={String(p.id)}>
                    <td style={{ fontWeight: 500, textTransform: 'capitalize' }}>
                      {fmtMes(p.periodo)}
                    </td>
                    <td style={{ fontWeight: 600 }}>{p.contrato.inmueble.nombre}</td>
                    <td>{p.contrato.inquilino?.nombre ?? '—'}</td>
                    <td>{fmtFecha(p.fechaVencimiento)}</td>
                    <td>{fmtFecha(p.fechaPagoReal)}</td>
                    <td>{p.metodoPago ?? '—'}</td>
                    <td>
                      {esPendiente  && <span className="badge badge-red">Pendiente</span>}
                      {esConRetraso && <span className="badge badge-orange">Con retraso</span>}
                      {esAlDia      && <span className="badge badge-green">Al día</span>}
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      {p.montoPagado !== null
                        ? `S/ ${Number(p.montoPagado).toFixed(2)}`
                        : <span style={{ color: '#94a3b8' }}>S/ {Number(p.montoEsperado).toFixed(2)}</span>
                      }
                    </td>
                    <td style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <a
                        href={`/pagos/${p.id}/editar`}
                        className="btn btn-secondary"
                        style={{ padding: '4px 12px', fontSize: '0.78rem' }}
                      >
                        Editar
                      </a>
                      <BtnEliminarPago id={String(p.id)} action={eliminarPago} />
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
