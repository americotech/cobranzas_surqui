import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { BtnEliminarInmueble } from './BtnEliminarInmueble'

async function eliminarInmueble(formData: FormData) {
  'use server'
  const id = BigInt(formData.get('id') as string)
  await prisma.inmueble.delete({ where: { id } })
  revalidatePath('/inmuebles')
}

export default async function InmueblesPage() {
  const inmuebles = await prisma.inmueble.findMany({
    include: {
      contratos: {
        include: { inquilino: true },
      },
    },
    orderBy: { nombre: 'asc' },
  })

  const conContratoActivo = inmuebles.filter(i =>
    i.contratos.some(c => c.estado === 'activo')
  ).length

  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Inmuebles</h1>
          <p>{inmuebles.length} inmuebles registrados</p>
        </div>
        <a href="/inmuebles/nuevo" className="btn btn-primary">
          + Nuevo Inmueble
        </a>
      </div>

      <div className="stat-grid" style={{ marginBottom: 28 }}>
        <div className="stat-card blue">
          <span className="stat-label">Total</span>
          <span className="stat-value">{inmuebles.length}</span>
        </div>
        <div className="stat-card green">
          <span className="stat-label">Ocupados</span>
          <span className="stat-value green">{conContratoActivo}</span>
        </div>
        <div className="stat-card red">
          <span className="stat-label">Disponibles</span>
          <span className="stat-value red">{inmuebles.length - conContratoActivo}</span>
        </div>
      </div>

      <div className="table-card">
        <div className="table-header">
          <h2>Todos los inmuebles</h2>
        </div>
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Dirección</th>
              <th>Descripción</th>
              <th>Inquilino activo</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {inmuebles.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', color: '#94a3b8', padding: '40px' }}>
                  Sin inmuebles registrados
                </td>
              </tr>
            ) : (
              inmuebles.map(inmueble => {
                const contratoActivo = inmueble.contratos.find(c => c.estado === 'activo')
                const inquilino = contratoActivo?.inquilino

                return (
                  <tr key={String(inmueble.id)}>
                    <td style={{ fontWeight: 600 }}>{inmueble.nombre}</td>
                    <td>{inmueble.direccion}</td>
                    <td>
                      {inmueble.descripcion
                        ? <span style={{ color: '#64748b' }}>{inmueble.descripcion}</span>
                        : <span style={{ color: '#94a3b8' }}>—</span>
                      }
                    </td>
                    <td>
                      {inquilino
                        ? <span className="badge badge-green">{inquilino.nombre}</span>
                        : <span style={{ color: '#94a3b8' }}>Disponible</span>
                      }
                    </td>
                    <td style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <a
                        href={`/inmuebles/${inmueble.id}/editar`}
                        className="btn btn-secondary"
                        style={{ padding: '4px 12px', fontSize: '0.78rem' }}
                      >
                        Editar
                      </a>
                      <BtnEliminarInmueble id={String(inmueble.id)} action={eliminarInmueble} />
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
