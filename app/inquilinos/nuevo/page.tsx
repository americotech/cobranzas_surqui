import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

async function crearInquilino(formData: FormData) {
  'use server'

  const nombre  = formData.get('nombre') as string
  const dni     = formData.get('dni') as string
  const telefono = formData.get('telefono') as string
  const email   = formData.get('email') as string

  await prisma.inquilino.create({
    data: {
      nombre,
      dni:      dni      || null,
      telefono: telefono || null,
      email:    email    || null,
    },
  })

  redirect('/inquilinos')
}

export default function NuevoInquilinoPage() {
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Nuevo Inquilino</h1>
          <p>Registra un nuevo inquilino</p>
        </div>
        <a href="/inquilinos" className="btn btn-secondary">
          ← Volver
        </a>
      </div>

      <div style={{ maxWidth: 560 }}>
        <form action={crearInquilino} className="form-card">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            <div className="form-group">
              <label>Nombre completo</label>
              <input
                type="text"
                name="nombre"
                required
                placeholder="Ej: Juan Pérez García"
                className="form-control"
              />
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label>DNI <span style={{ color: '#94a3b8', fontWeight: 400 }}>(opcional)</span></label>
                <input
                  type="text"
                  name="dni"
                  maxLength={8}
                  placeholder="Ej: 12345678"
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Teléfono <span style={{ color: '#94a3b8', fontWeight: 400 }}>(opcional)</span></label>
                <input
                  type="text"
                  name="telefono"
                  placeholder="Ej: 987654321"
                  className="form-control"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Email <span style={{ color: '#94a3b8', fontWeight: 400 }}>(opcional)</span></label>
              <input
                type="email"
                name="email"
                placeholder="Ej: juan@email.com"
                className="form-control"
              />
            </div>

            <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '13px' }}>
                Guardar Inquilino
              </button>
              <a href="/inquilinos" className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center', padding: '13px' }}>
                Cancelar
              </a>
            </div>

          </div>
        </form>
      </div>
    </>
  )
}
