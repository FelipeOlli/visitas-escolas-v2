const MAP: Record<string, { label: string; classes: string }> = {
  pendente:   { label: 'Pendente',   classes: 'bg-red-500/10 text-red-400 border border-red-500/20' },
  visitado:   { label: 'Visitado',   classes: 'bg-[#ccf381]/10 text-[#ccf381] border border-[#ccf381]/20' },
  tentativa:  { label: 'Tentativa',  classes: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' },
  reagendado: { label: 'Reagendado', classes: 'bg-violet-500/10 text-violet-400 border border-violet-500/20' },
}

export function StatusBadge({ status }: { status: string }) {
  const s = MAP[status] ?? MAP.pendente
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${s.classes}`}>
      {s.label}
    </span>
  )
}

export const STATUS_DOT_COLOR: Record<string, string> = {
  pendente:   '#ef4444',
  visitado:   '#ccf381',
  tentativa:  '#fbbf24',
  reagendado: '#a78bfa',
}
