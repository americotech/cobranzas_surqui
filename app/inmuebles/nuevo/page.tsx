import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

async function crearInmueble(formData: FormData) {
  'use server'

  const nombre      = formData.get('nombre') as string
  const direccion   = formData.get('direccion') as string
  const descripcion = formData.get('descripcion') as string

  await prisma.inmueble.create({
    data: {
      nombre,
      direccion,
      descripcion: descripcion || null,
    },
  })

  redirect('/inmuebles')
}

export default function NuevoInmueblePage() {
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Nuevo Inmueble</h1>
          <p>Registra un nuevo inmueble</p>
        </div>
        <a href="/inmuebles" className="btn btn-secondary">
          ← Volver
        </a>
      </div>

      <div style={{ maxWidth: 560 }}>
        <form action={crearInmueble} className="form-card">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            <div className="form-group">
              <label>Nombre</label>
              <input
                type="text"
                name="nombre"
                required
                placeholder="Ej: Departamento 3B"
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label>Dirección</label>
              <input
                type="text"
                name="direccion"
                required
                placeholder="Ej: Av. Lima 123, Miraflores"
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
                placeholder="Ej: 2 dormitorios, 1 baño, cocina equipada..."
                className="form-control"
                style={{ resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <a href="/inmuebles" className="btn btn-secondary">Cancelar</a>
              <button type="submit" className="btn btn-primary">Guardar</button>
            </div>

          </div>
        </form>
      </div>
    </>
  )
}
