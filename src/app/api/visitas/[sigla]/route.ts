import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(req: Request, { params }: { params: { sigla: string } }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { status, dataHora, contato, contatoTel, obs } = await req.json()

  await prisma.visita.upsert({
    where:  { sigla: params.sigla },
    update: { status, dataHora: dataHora ? new Date(dataHora) : null, contato, contatoTel, obs, userId: session.user.id },
    create: { sigla: params.sigla, status, dataHora: dataHora ? new Date(dataHora) : null, contato, contatoTel, obs, userId: session.user.id },
  })

  return NextResponse.json({ ok: true })
}
