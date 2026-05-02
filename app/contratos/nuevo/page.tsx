import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

async function crearContrato(formData: FormData) {
  'use server'

  const inmuebleId   = BigInt(formData.get('inmuebleId') as string)
  const inquilinoId  = formData.get('inquilinoId') as string
  const montoRenta   = parseFloat(formData.get('montoRenta') as string)
  const diaVencimiento = parseInt(formData.get('diaVencimiento') as string, 10)
  const fechaInicio  = new Date(formData.get('fechaInicio') as string)
  const fechaFinStr  = formData.get('fechaFin') as string
  const estado       = formData.get('estado') as string

  await prisma.contrato.create({
    data: {
      inmuebleId,
      inquilinoId: inquilinoId ? BigInt(inquilinoId) : null,
      montoRenta,
      diaVencimiento,
      fechaInicio,
      fechaFin: fechaFinStr ? new Date(fechaFinStr) : null,
      estado,
    },
  })

  redirect('/contratos')
}

export default async function NuevoContratoPage() {
  const [inmuebles, inquilinos] = await Promise.all([
    prisma.inmueble.findMany({ orderBy: { nombre: 'asc' } }),
    prisma.inquilino.findMany({ orderBy: { nombre: 'asc' } }),
  ])

  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Nuevo Contrato</h1>
          <p>Registra un nuevo contrato de alquiler</p>
        </div>
        <a href="/contratos" className="btn btn-secondary">
          ← Volver
        </a>
      </div>

      <div style={{ maxWidth: 640 }}>
        <form action={crearContrato} className="form-card">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            <div className="form-grid-2">
              <div className="form-group">
                <label>Inmueble</label>
                <select name="inmuebleId" required className="form-control">
                  <option value="">Seleccionar inmueble...</option>
                  {inmuebles.map(i => (
                    <option key={String(i.id)} value={String(i.id)}>
                      {i.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Inquilino</label>
                <select name="inquilinoId" className="form-control">
                  <option value="">Sin inquilino</option>
                  {inquilinos.map(i => (
                    <option key={String(i.id)} value={String(i.id)}>
                      {i.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label>Monto de Renta (S/)</label>
                <input
                  type="number"
                  name="montoRenta"
                  step="0.01"
                  required
                  placeholder="Ej: 1500.00"
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
                  placeholder="Ej: 15"
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
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Fecha de Fin <span style={{ color: '#94a3b8', fontWeight: 400 }}>(opcional)</span></label>
                <input
                  type="date"
                  name="fechaFin"
                  className="form-control"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Estado</label>
              <select name="estado" required className="form-control" defaultValue="activo">
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '13px' }}>
                Guardar Contrato
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
