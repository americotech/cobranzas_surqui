import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'

function toInputDate(d: Date | null) {
  if (!d) return ''
  return new Date(d.getTime() + d.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 10)
}

async function actualizarContrato(id: bigint, formData: FormData) {
  'use server'

  const inquilinoId    = formData.get('inquilinoId') as string
  const montoRenta     = parseFloat(formData.get('montoRenta') as string)
  const diaVencimiento = parseInt(formData.get('diaVencimiento') as string, 10)
  const fechaInicio    = new Date(formData.get('fechaInicio') as string)
  const fechaFinStr    = formData.get('fechaFin') as string
  const estado         = formData.get('estado') as string

  await prisma.contrato.update({
    where: { id },
    data: {
      inquilinoId:   inquilinoId ? BigInt(inquilinoId) : null,
      montoRenta,
      diaVencimiento,
      fechaInicio,
      fechaFin: fechaFinStr ? new Date(fechaFinStr) : null,
      estado,
    },
  })

  // Sincronizar montoEsperado en pagos pendientes con la renta actual
  await prisma.pago.updateMany({
    where: { contratoId: id, fechaPagoReal: null },
    data: { montoEsperado: montoRenta },
  })

  redirect('/contratos')
}

export default async function EditarContratoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const contratoId = BigInt(id)

  const [contrato, inquilinos] = await Promise.all([
    prisma.contrato.findUnique({
      where: { id: contratoId },
      include: { inmueble: true, inquilino: true },
    }),
    prisma.inquilino.findMany({ orderBy: { nombre: 'asc' } }),
  ])

  if (!contrato) notFound()

  const action = actualizarContrato.bind(null, contratoId)

  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Editar Contrato</h1>
          <p>{contrato.inmueble.nombre}{contrato.inquilino ? ` — ${contrato.inquilino.nombre}` : ''}</p>
        </div>
        <a href="/contratos" className="btn btn-secondary">
          ← Volver
        </a>
      </div>

      <div style={{ maxWidth: 640 }}>
        <form action={action} className="form-card">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Inmueble: solo lectura */}
            <div className="form-group">
              <label>Inmueble</label>
              <input
                type="text"
                readOnly
                value={contrato.inmueble.nombre}
                className="form-control"
                style={{ opacity: 0.6, cursor: 'default' }}
              />
            </div>

            <div className="form-group">
              <label>Inquilino</label>
              <select name="inquilinoId" className="form-control" defaultValue={contrato.inquilinoId ? String(contrato.inquilinoId) : ''}>
                <option value="">Sin inquilino</option>
                {inquilinos.map(i => (
                  <option key={String(i.id)} value={String(i.id)}>
                    {i.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label>Monto de Renta (S/)</label>
                <input
                  type="number"
                  name="montoRenta"
                  step="0.01"
                  required
                  defaultValue={Number(contrato.montoRenta)}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Día de Vencimiento</label>
                <input
                  type="number"
                  name="diaVencimiento"
                  min={1}
                  max={28}
                  required
                  defaultValue={contrato.diaVencimiento}
                  className="form-control"
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label>Fecha de Inicio</label>
                <input
                  type="date"
                  name="fechaInicio"
                  required
                  defaultValue={toInputDate(contrato.fechaInicio)}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Fecha de Fin <span style={{ color: '#94a3b8', fontWeight: 400 }}>(opcional)</span></label>
                <input
                  type="date"
                  name="fechaFin"
                  defaultValue={toInputDate(contrato.fechaFin)}
                  className="form-control"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Estado</label>
              <select name="estado" required className="form-control" defaultValue={contrato.estado}>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '13px' }}>
                Guardar Cambios
              </button>
              <a href="/contratos" className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center', padding: '13px' }}>
                Cancelar
              </a>
            </div>

          </div>
        </form>
      </div>
    </>
  )
}
