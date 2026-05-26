import Link from 'next/link'
import { getCre, distLabel } from '@/lib/schools'
import { StatusBadge } from './StatusBadge'
import type { School } from '@/lib/schools'

interface VisitaInfo {
  status: string
  dataHora?: string | null
  contato?: string | null
  obs?: string | null
  userName?: string | null
  updatedAt?: string | null
}

interface Props {
  school: School
  visita?: VisitaInfo
  distKm?: number
}

export function SchoolCard({ school, visita, distKm }: Props) {
  const status = visita?.status ?? 'pendente'
  const cre = getCre(school.sigla)

  return (
    <Link
      href={`/escolas/${encodeURIComponent(school.sigla)}`}
      className="block px-4 py-3 border-b border-zinc-100 hover:bg-zinc-50 transition-colors"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium text-zinc-900 truncate">{school.nome}</p>
          <p className="text-xs text-zinc-500 mt-0.5">
            {school.bairro} · CRE {cre}
          </p>
          {visita?.obs && (
            <p className="text-xs text-zinc-400 mt-1 truncate">{visita.obs}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <StatusBadge status={status} />
          {distKm !== undefined && (
            <span className="text-xs text-zinc-400">{distLabel(distKm)}</span>
          )}
        </div>
      </div>
    </Link>
  )
}
