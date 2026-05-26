import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const rows = await prisma.visita.findMany({
    include: { user: { select: { name: true } } },
  })

  const result: Record<string, object> = {}
  for (const r of rows) {
    result[r.sigla] = {
      status:     r.status,
      dataHora:   r.dataHora?.toISOString() ?? null,
      contato:    r.contato,
      contatoTel: r.contatoTel,
      obs:        r.obs,
      userName:   r.user.name,
      updatedAt:  r.updatedAt.toISOString(),
    }
  }

  return NextResponse.json(result)
}
