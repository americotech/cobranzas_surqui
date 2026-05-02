import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'

async function actualizarInquilino(id: bigint, formData: FormData) {
  'use server'

  const nombre   = formData.get('nombre') as string
  const dni      = formData.get('dni') as string
  const telefono = formData.get('telefono') as string
  const email    = formData.get('email') as string

  await prisma.inquilino.update({
    where: { id },
    data: {
      nombre,
      dni:      dni      || null,
      telefono: telefono || null,
      email:    email    || null,
    },
  })

  redirect('/inquilinos')
}

export default async function EditarInquilinoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const inquilinoId = BigInt(id)

  const inquilino = await prisma.inquilino.findUnique({
    where: { id: inquilinoId },
  })

  if (!inquilino) notFound()

  const action = actualizarInquilino.bind(null, inquilinoId)

  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Editar Inquilino</h1>
          <p>{inquilino.nombre}</p>
        </div>
        <a href="/inquilinos" className="btn btn-secondary">
          ← Volver
        </a>
      </div>

      <div style={{ maxWidth: 560 }}>
        <form action={action} className="form-card">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            <div className="form-group">
              <label>Nombre completo</label>
              <input
                type="text"
                name="nombre"
                required
                defaultValue={inquilino.nombre}
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
                  defaultValue={inquilino.dni ?? ''}
                  placeholder="Ej: 12345678"
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Teléfono <span style={{ color: '#94a3b8', fontWeight: 400 }}>(opcional)</span></label>
                <input
                  type="text"
                  name="telefono"
                  defaultValue={inquilino.telefono ?? ''}
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
                defaultValue={inquilino.email ?? ''}
                placeholder="Ej: juan@email.com"
                className="form-control"
              />
            </div>

            <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '13px' }}>
                Guardar Cambios
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
