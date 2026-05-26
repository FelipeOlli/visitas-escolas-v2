export type School = {
  id_setor: string
  sigla:    string
  nome:     string
  endereco: string
  bairro:   string
  cep:      string
  email:    string
  telefone: string
  lat:      number | null
  lng:      number | null
}

export function getCre(sigla: string): string {
  const m = sigla.match(/E\/CRE\((\d{2})\./)
  return m ? m[1] : '—'
}

export function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function distLabel(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`
}
