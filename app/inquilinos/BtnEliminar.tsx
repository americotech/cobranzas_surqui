'use client'

export function BtnEliminar({
  id,
  action,
  label = 'este registro',
}: {
  id: string
  action: (formData: FormData) => Promise<void>
  label?: string
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(`¿Eliminar este ${label}?`)) e.preventDefault()
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="btn"
        style={{ padding: '4px 12px', fontSize: '0.78rem', background: '#fee2e2', color: '#dc2626' }}
      >
        Eliminar
      </button>
    </form>
  )
}
