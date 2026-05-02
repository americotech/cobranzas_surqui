import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

async function registrarPago(formData: FormData) {
  'use server'

  const contratoId = BigInt(formData.get('contratoId') as string)
  const periodoStr = formData.get('periodo') as string
  const fechaPagoRealStr = formData.get('fechaPagoReal') as string
  const montoPagadoStr = formData.get('montoPagado') as string
  const metodoPago = formData.get('metodoPago') as string
  const observaciones = formData.get('observaciones') as string

  // Parsear "YYYY-MM" directamente para evitar conversión UTC que desplaza el mes
  const [anio, mes] = periodoStr.split('-').map(Number)
  const fechaPagoReal = fechaPagoRealStr ? new Date(fechaPagoRealStr) : new Date()
  const montoPagado = montoPagadoStr ? parseFloat(montoPagadoStr) : null

  const contrato = await prisma.contrato.findUnique({
    where: { id: contratoId },
    include: { inmueble: true }
  })

  if (!contrato) throw new Error('Contrato no encontrado')

  const periodo = new Date(Date.UTC(anio, mes - 1, 1))
  const finPeriodo = new Date(Date.UTC(anio, mes, 1))
  const fechaVencimiento = new Date(Date.UTC(anio, mes - 1, contrato.diaVencimiento))

  const pagosDelMes = await prisma.pago.findMany({
    where: {
      contratoId,
      periodo: { gte: periodo, lt: finPeriodo },
    },
    orderBy: { createdAt: 'asc' },
  })

  if (pagosDelMes.length > 0) {
    const pagoObjetivo = pagosDelMes.find((p) => p.fechaPagoReal === null) ?? pagosDelMes[0]

    await prisma.pago.update({
      where: { id: pagoObjetivo.id },
      data: {
        periodo,
        fechaVencimiento,
        montoEsperado: contrato.montoRenta,
        fechaPagoReal,
        montoPagado,
        metodoPago,
        observaciones,
      },
    })

    const idsEliminar = pagosDelMes
      .filter((p) => p.id !== pagoObjetivo.id)
      .map((p) => p.id)

    if (idsEliminar.length > 0) {
      await prisma.pago.deleteMany({
        where: { id: { in: idsEliminar } },
      })
    }
  } else {
    await prisma.pago.create({
      data: {
        contratoId,
        periodo,
        fechaVencimiento,
        fechaPagoReal,
        montoEsperado: contrato.montoRenta,
        montoPagado,
        metodoPago,
        observaciones,
      },
    })
  }

  revalidatePath('/dashboard')
  revalidatePath('/pagos')
  redirect('/dashboard')
}

export default async function NuevoPagoPage() {
  const contratos = await prisma.contrato.findMany({
    include: { inmueble: true, inquilino: true },
    where: { estado: 'activo' },
    orderBy: { inmueble: { nombre: 'asc' } }
  })

  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Registrar Pago</h1>
          <p>Ingresa los datos del pago recibido</p>
        </div>
        <a href="/dashboard" className="btn btn-secondary">
          ← Volver
        </a>
      </div>

      <div style={{ maxWidth: 640 }}>
        <form action={registrarPago} className="form-card">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            <div className="form-group">
              <label>Inmueble / Inquilino</label>
              <select name="contratoId" required className="form-control">
                <option value="">Seleccionar inmueble...</option>
                {contratos.map((c) => (
                  <option key={String(c.id)} value={String(c.id)}>
                    {c.inmueble.nombre} — {c.inquilino?.nombre} (S/ {c.montoRenta.toString()})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label>Período (Mes)</label>
                <input
                  type="month"
                  name="periodo"
                  required
                  defaultValue="2026-04"
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Fecha de Pago Real</label>
                <input
                  type="date"
                  name="fechaPagoReal"
                  required
                  defaultValue={new Date().toISOString().slice(0, 10)}
                  className="form-control"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Monto Pagado (S/)</label>
              <input
                type="number"
                name="montoPagado"
                step="0.01"
                required
                placeholder="Ej: 1850.00"
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label>Método de Pago</label>
              <select name="metodoPago" required className="form-control">
                <option value="">Seleccionar método...</option>
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
                rows={4}
                placeholder="Ej: Pago parcial, con retraso, nota adicional..."
                className="form-control"
              />
            </div>

            <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '13px' }}>
                Registrar Pago
              </button>
              <a href="/dashboard" className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center', padding: '13px' }}>
                Cancelar
              </a>
            </div>

          </div>
        </form>
      </div>
    </>
  )
}
