import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { BtnEliminar } from './BtnEliminar'

async function eliminarInquilino(formData: FormData) {
  'use server'
  const id = BigInt(formData.get('id') as string)
  await prisma.inquilino.delete({ where: { id } })
  revalidatePath('/inquilinos')
}

export default async function InquilinosPage() {
  const inquilinos = await prisma.inquilino.findMany({
    include: { contratos: { include: { inmueble: true } } },
    orderBy: { nombre: 'asc' },
  })

  const conContrato = inquilinos.filter(i =>
    i.contratos.some(c => c.estado === 'activo')
  ).length

  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Inquilinos</h1>
          <p>{inquilinos.length} inquilinos registrados</p>
        </div>
        <a href="/inquilinos/nuevo" className="btn btn-primary">
          + Nuevo Inquilino
        </a>
      </div>

      <div className="stat-grid" style={{ marginBottom: 28 }}>
        <div className="stat-card blue">
          <span className="stat-label">Total</span>
          <span className="stat-value">{inquilinos.length}</span>
        </div>
        <div className="stat-card green">
          <span className="stat-label">Con contrato activo</span>
          <span className="stat-value green">{conContrato}</span>
        </div>
        <div className="stat-card red">
          <span className="stat-label">Sin contrato activo</span>
          <span className="stat-value red">{inquilinos.length - conContrato}</span>
        </div>
      </div>

      <div className="table-card">
        <div className="table-header">
          <h2>Todos los inquilinos</h2>
        </div>
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>DNI</th>
              <th>Teléfono</th>
              <th>Email</th>
              <th>Inmueble(s)</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {inquilinos.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', color: '#94a3b8', padding: '40px' }}>
                  Sin inquilinos registrados
                </td>
              </tr>
            ) : (
              inquilinos.map(i => {
                const inmuebles = i.contratos
                  .filter(c => c.estado === 'activo')
                  .map(c => c.inmueble.nombre)
                  .join(', ')

                return (
                  <tr key={String(i.id)}>
                    <td style={{ fontWeight: 600 }}>{i.nombre}</td>
                    <td>{i.dni ?? <span style={{ color: '#94a3b8' }}>—</span>}</td>
                    <td>{i.telefono ?? <span style={{ color: '#94a3b8' }}>—</span>}</td>
                    <td>{i.email ?? <span style={{ color: '#94a3b8' }}>—</span>}</td>
                    <td>
                      {inmuebles
                        ? <span className="badge badge-green">{inmuebles}</span>
                        : <span style={{ color: '#94a3b8' }}>Sin contrato activo</span>
                      }
                    </td>
                    <td style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <a
                        href={`/inquilinos/${i.id}/editar`}
                        className="btn btn-secondary"
                        style={{ padding: '4px 12px', fontSize: '0.78rem' }}
                      >
                        Editar
                      </a>
                      <BtnEliminar id={String(i.id)} action={eliminarInquilino} label="inquilino" />
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
