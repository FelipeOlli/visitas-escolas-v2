import { EscolasClient } from '@/components/EscolasClient'
import { prisma } from '@/lib/prisma'
import type { School } from '@/lib/schools'
import schoolsData from '../../../../public/schools.json'

export default async function EscolasPage() {
  const visitas = await prisma.visita.findMany({
    include: { user: { select: { name: true } } },
  })

  const visitasMap: Record<string, { status: string; dataHora?: string | null; contato?: string | null; contatoTel?: string | null; obs?: string | null; userName?: string | null; updatedAt?: string | null }> = {}
  for (const v of visitas) {
    visitasMap[v.sigla] = {
      status:     v.status,
      dataHora:   v.dataHora?.toISOString() ?? null,
      contato:    v.contato,
      contatoTel: v.contatoTel,
      obs:        v.obs,
      userName:   v.user.name,
      updatedAt:  v.updatedAt.toISOString(),
    }
  }

  const schools = (schoolsData as School[])

  return <EscolasClient schools={schools} initialVisitas={visitasMap} />
}
