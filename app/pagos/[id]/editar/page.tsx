import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'

function toInputDate(d: Date | null) {
  if (!d) return ''
  const local = new Date(d.getTime() + d.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 10)
}

async function actualizarPago(id: bigint, formData: FormData) {
  'use server'

  const fechaPagoRealStr = formData.get('fechaPagoReal') as string
  const montoPagadoStr   = formData.get('montoPagado') as string
  const metodoPago       = formData.get('metodoPago') as string | null
  const observaciones    = formData.get('observaciones') as string | null

  await prisma.pago.update({
    where: { id },
    data: {
      fechaPagoReal: fechaPagoRealStr ? new Date(fechaPagoRealStr) : null,
      montoPagado:   montoPagadoStr   ? parseFloat(montoPagadoStr) : null,
      metodoPago:    metodoPago       || null,
      observaciones: observaciones    || null,
    },
  })

  redirect('/pagos')
}

export default async function EditarPagoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const pagoId = BigInt(id)

  const pago = await prisma.pago.findUnique({
    where: { id: pagoId },
    include: {
      contrato: { include: { inmueble: true, inquilino: true } },
    },
  })

  if (!pago) notFound()

  const action = actualizarPago.bind(null, pagoId)

  const fmtMes = (d: Date) =>
    new Date(d.getTime() + d.getTimezoneOffset() * 60_000).toLocaleDateString(
      'es-PE',
      { month: 'long', year: 'numeric' }
    )

  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Editar Pago</h1>
          <p>
            {pago.contrato.inmueble.nombre}
            {pago.contrato.inquilino ? ` — ${pago.contrato.inquilino.nombre}` : ''} ·{' '}
            <span style={{ textTransform: 'capitalize' }}>{fmtMes(pago.periodo)}</span>
          </p>
        </div>
        <a href="/pagos" className="btn btn-secondary">
          ← Volver
        </a>
      </div>

      <div style={{ maxWidth: 640 }}>
        <form action={action} className="form-card">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Info de solo lectura */}
            <div className="form-grid-2">
              <div className="form-group">
                <label>Inmueble</label>
                <input
                  type="text"
                  readOnly
                  value={pago.contrato.inmueble.nombre}
                  className="form-control"
                  style={{ opacity: 0.6, cursor: 'default' }}
                />
              </div>
              <div className="form-group">
                <label>Período</label>
                <input
                  type="text"
                  readOnly
                  value={fmtMes(pago.periodo)}
                  className="form-control"
                  style={{ opacity: 0.6, cursor: 'default', textTransform: 'capitalize' }}
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label>Monto Esperado (S/)</label>
                <input
                  type="text"
                  readOnly
                  value={Number(pago.montoEsperado).toFixed(2)}
                  className="form-control"
                  style={{ opacity: 0.6, cursor: 'default' }}
                />
              </div>
              <div className="form-group">
                <label>Fecha de Vencimiento</label>
                <input
                  type="text"
                  readOnly
                  value={toInputDate(pago.fechaVencimiento)}
                  className="form-control"
                  style={{ opacity: 0.6, cursor: 'default' }}
                />
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #1e293b', margin: '4px 0' }} />

            {/* Campos editables */}
            <div className="form-grid-2">
              <div className="form-group">
                <label>Fecha de Pago Real</label>
                <input
                  type="date"
                  name="fechaPagoReal"
                  defaultValue={toInputDate(pago.fechaPagoReal)}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Monto Pagado (S/)</label>
                <input
                  type="number"
                  name="montoPagado"
                  step="0.01"
                  defaultValue={pago.montoPagado !== null ? Number(pago.montoPagado) : ''}
                  placeholder={`Ej: ${Number(pago.montoEsperado).toFixed(2)}`}
                  className="form-control"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Método de Pago</label>
              <select name="metodoPago" className="form-control" defaultValue={pago.metodoPago ?? ''}>
                <option value="">Sin especificar</option>
                <option value="Yape">Yape</option>
                <option value="Transferencia">Transferencia Bancaria</option>
                <option value="Efectivo">Efectivo</option>
                <option value="Plin">Plin</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <div className="form-group">
              <label>Observaciones</label>
              <textarea
                name="observaciones"
                rows={3}
                defaultValue={pago.observaciones ?? ''}
                placeholder="Notas adicionales..."
                className="form-control"
              />
            </div>

            <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ flex: 1, justifyContent: 'center', padding: '13px' }}
              >
                Guardar Cambios
              </button>
              <a
                href="/pagos"
                className="btn btn-secondary"
                style={{ flex: 1, justifyContent: 'center', padding: '13px' }}
              >
                Cancelar
              </a>
            </div>

          </div>
        </form>
      </div>
    </>
  )
}
