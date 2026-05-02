import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Iniciando seed de pagos...')

  // Limpiar pagos existentes
  await prisma.pago.deleteMany()
  console.log('🗑️  Pagos anteriores eliminados')

  // Obtener contratos activos ordenados por id
  const contratos = await prisma.contrato.findMany({
    where: { estado: 'activo' },
    orderBy: { id: 'asc' },
  })

  const periodoMarzo = new Date(Date.UTC(2026, 2, 1)) // Marzo 2026
  const periodoAbril = new Date(Date.UTC(2026, 3, 1)) // Abril 2026

  for (let i = 0; i < contratos.length; i++) {
    const c = contratos[i]
    const dia = c.diaVencimiento

    // ── Marzo 2026: todos pagaron a tiempo (antes o en su fecha de vencimiento) ──
    // Renta de marzo vence el día {dia} de marzo
    const vencMarzo = new Date(Date.UTC(2026, 2, dia))
    await prisma.pago.create({
      data: {
        contratoId:      c.id,
        periodo:         periodoMarzo,
        fechaVencimiento: vencMarzo,
        fechaPagoReal:   vencMarzo,          // pagó justo en la fecha de vencimiento
        montoEsperado:   c.montoRenta,
        montoPagado:     c.montoRenta,
        metodoPago:      i % 2 === 0 ? 'Yape' : 'Transferencia',
      }
    })

    // ── Abril 2026: solo 1er-Piso (i=0) y 2do-Piso (i=1) han pagado ──
    // Renta de abril vence el día {dia} de abril
    const vencAbril = new Date(Date.UTC(2026, 3, dia))
    const pagado = i < 2

    await prisma.pago.create({
      data: {
        contratoId:      c.id,
        periodo:         periodoAbril,
        fechaVencimiento: vencAbril,
        fechaPagoReal:   pagado ? vencAbril : null,
        montoEsperado:   c.montoRenta,
        montoPagado:     pagado ? c.montoRenta : null,
        metodoPago:      pagado ? 'Yape' : null,
      }
    })
  }

  console.log(`✅ ${contratos.length * 2} pagos creados (${contratos.length} de marzo + ${contratos.length} de abril)`)
  console.log('🌱 Seed completado!')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(async () => await prisma.$disconnect())