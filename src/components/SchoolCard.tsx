import Link from 'next/link'
import { getCre, distLabel } from '@/lib/schools'
import { STATUS_DOT_COLOR } from './StatusBadge'
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
  const dotColor = STATUS_DOT_COLOR[status] ?? STATUS_DOT_COLOR.pendente

  return (
    <Link
      href={`/escolas/${encodeURIComponent(school.sigla)}`}
      className="block p-4 rounded-[20px] bg-[#0a0a0a] border border-[#262626] hover:border-[#404040] hover:-translate-y-0.5 transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <span
            className="mt-1.5 w-2.5 h-2.5 rounded-full shrink-0"
            style={{
              background: dotColor,
              boxShadow: `0 0 6px ${dotColor}80`,
            }}
          />
          <div className="min-w-0">
            <p className="font-display text-sm font-semibold text-[#fafafa] truncate leading-snug">
              {school.nome}
            </p>
            <p className="text-xs text-[#737373] mt-0.5">
              {school.bairro} · CRE {cre}
            </p>
            {visita?.obs && (
              <p className="text-xs text-[#525252] mt-1 truncate">{visita.obs}</p>
            )}
          </div>
        </div>
        {distKm !== undefined && (
          <span className="text-xs text-[#525252] shrink-0 mt-0.5">{distLabel(distKm)}</span>
        )}
      </div>
    </Link>
  )
}
