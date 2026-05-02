'use client'

export function BtnEliminarPago({
  id,
  action,
}: {
  id: string
  action: (formData: FormData) => Promise<void>
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm('¿Eliminar este pago?')) e.preventDefault()
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
