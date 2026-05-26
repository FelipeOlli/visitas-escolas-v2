const MAP: Record<string, { label: string; classes: string }> = {
  pendente:   { label: 'Pendente',   classes: 'bg-red-100 text-red-800' },
  visitado:   { label: 'Visitado',   classes: 'bg-green-100 text-green-800' },
  tentativa:  { label: 'Tentativa',  classes: 'bg-yellow-100 text-yellow-800' },
  reagendado: { label: 'Reagendado', classes: 'bg-purple-100 text-purple-800' },
}

export function StatusBadge({ status }: { status: string }) {
  const s = MAP[status] ?? MAP.pendente
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${s.classes}`}>
      {s.label}
    </span>
  )
}

export const STATUS_DOT_COLOR: Record<string, string> = {
  pendente:   '#C62828',
  visitado:   '#2E7D32',
  tentativa:  '#F57F17',
  reagendado: '#6A1B9A',
}
