import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { EscolaDetail } from '@/components/EscolaDetail'
import type { School } from '@/lib/schools'
import schoolsData from '../../../../../public/schools.json'

interface Props {
  params: { sigla: string }
}

export default async function EscolaPage({ params }: Props) {
  const sigla = decodeURIComponent(params.sigla)
  const school = (schoolsData as School[]).find(s => s.sigla === sigla)
  if (!school) notFound()

  const visita = await prisma.visita.findUnique({
    where: { sigla },
    include: { user: { select: { name: true } } },
  })

  return <EscolaDetail school={school} visita={visita} />
}
