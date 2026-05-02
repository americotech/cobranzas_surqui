import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'

async function actualizarInmueble(id: bigint, formData: FormData) {
  'use server'

  const nombre      = formData.get('nombre') as string
  const direccion   = formData.get('direccion') as string
  const descripcion = formData.get('descripcion') as string

  await prisma.inmueble.update({
    where: { id },
    data: {
      nombre,
      direccion,
      descripcion: descripcion || null,
    },
  })

  redirect('/inmuebles')
}

export default async function EditarInmueblePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const inmuebleId = BigInt(id)

  const inmueble = await prisma.inmueble.findUnique({
    where: { id: inmuebleId },
  })

  if (!inmueble) notFound()

  const action = actualizarInmueble.bind(null, inmuebleId)

  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Editar Inmueble</h1>
          <p>{inmueble.nombre}</p>
        </div>
        <a href="/inmuebles" className="btn btn-secondary">
          ← Volver
        </a>
      </div>

      <div style={{ maxWidth: 560 }}>
        <form action={action} className="form-card">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            <div className="form-group">
              <label>Nombre</label>
              <input
                type="text"
                name="nombre"
                required
                defaultValue={inmueble.nombre}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label>Dirección</label>
              <input
                type="text"
                name="direccion"
                required
                defaultValue={inmueble.direccion}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label>
                Descripción{' '}
                <span style={{ color: '#94a3b8', fontWeight: 400 }}>(opcional)</span>
              </label>
              <textarea
                name="descripcion"
                rows={3}
                defaultValue={inmueble.descripcion ?? ''}
                className="form-control"
                style={{ resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <a href="/inmuebles" className="btn btn-secondary">Cancelar</a>
              <button type="submit" className="btn btn-primary">Guardar cambios</button>
            </div>

          </div>
        </form>
      </div>
    </>
  )
}
