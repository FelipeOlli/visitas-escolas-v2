'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { SchoolCard } from './SchoolCard'
import { STATUS_DOT_COLOR } from './StatusBadge'
import { haversine } from '@/lib/schools'
import type { School } from '@/lib/schools'

const FALLBACK = { lat: -22.8697, lng: -43.3297 }

const STATUS_OPTIONS = ['todos', 'pendente', 'visitado', 'tentativa', 'reagendado'] as const

interface VisitaMap {
  [sigla: string]: {
    status: string
    dataHora?: string | null
    contato?: string | null
    obs?: string | null
    userName?: string | null
    updatedAt?: string | null
  }
}

interface Props {
  schools: School[]
  initialVisitas: VisitaMap
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    google: any
    initMap: () => void
  }
}

export function EscolasClient({ schools, initialVisitas }: Props) {
  const [visitas, setVisitas] = useState<VisitaMap>(initialVisitas)
  const [userPos, setUserPos] = useState(FALLBACK)
  const [filter, setFilter] = useState<string>('todos')
  const [search, setSearch] = useState('')
  const [mapsReady, setMapsReady] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstance = useRef<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markers = useRef<Record<string, { marker: any; dot: HTMLDivElement }>>({})

  // Carregar Maps SDK
  useEffect(() => {
    if (window.google?.maps) { setMapsReady(true); return }
    window.initMap = () => setMapsReady(true)
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}&callback=initMap&libraries=marker,places&v=beta`
    script.async = true
    document.head.appendChild(script)
  }, [])

  // Inicializar mapa
  useEffect(() => {
    if (!mapsReady || !mapRef.current || mapInstance.current) return
    mapInstance.current = new window.google.maps.Map(mapRef.current, {
      center: FALLBACK,
      zoom: 12,
      mapId: 'visitas_map',
      streetViewControl: false,
      mapTypeControl: false,
    })
    placeMarkers()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapsReady])

  const getColor = useCallback((sigla: string) => {
    const status = visitas[sigla]?.status ?? 'pendente'
    return STATUS_DOT_COLOR[status] ?? STATUS_DOT_COLOR.pendente
  }, [visitas])

  function placeMarkers() {
    if (!mapInstance.current) return
    schools.forEach(school => {
      if (!school.lat || !school.lng) return
      const dot = document.createElement('div')
      dot.style.cssText = `width:10px;height:10px;border-radius:50%;background:${getColor(school.sigla)};border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,.4);cursor:pointer;`
      const marker = new window.google.maps.marker.AdvancedMarkerElement({
        map: mapInstance.current!,
        position: { lat: school.lat, lng: school.lng },
        content: dot,
        title: school.nome,
      })
      marker.addListener('click', () => {
        window.location.href = `/escolas/${encodeURIComponent(school.sigla)}`
      })
      markers.current[school.sigla] = { marker, dot }
    })
  }

  // Atualizar cores dos marcadores quando visitas mudam
  useEffect(() => {
    Object.entries(markers.current).forEach(([sigla, { dot }]) => {
      dot.style.background = getColor(sigla)
    })
  }, [getColor])

  // Geolocalização
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(pos => {
      setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude })
    })
  }, [])

  const filtered = schools
    .filter(s => {
      const status = visitas[s.sigla]?.status ?? 'pendente'
      if (filter !== 'todos' && status !== filter) return false
      if (search) {
        const q = search.toLowerCase()
        return s.nome.toLowerCase().includes(q) ||
               s.bairro.toLowerCase().includes(q) ||
               s.endereco.toLowerCase().includes(q)
      }
      return true
    })
    .map(s => ({ school: s, distKm: s.lat && s.lng ? haversine(userPos.lat, userPos.lng, s.lat, s.lng) : Infinity }))
    .sort((a, b) => a.distKm - b.distKm)

  const counts = schools.reduce((acc, s) => {
    const st = visitas[s.sigla]?.status ?? 'pendente'
    acc[st] = (acc[st] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <aside className="w-80 flex flex-col border-r border-zinc-200 bg-white shrink-0">
        {/* Stats */}
        <div className="px-4 py-3 border-b border-zinc-100">
          <div className="flex gap-3 text-xs text-zinc-500">
            <span className="text-green-700 font-medium">{counts.visitado ?? 0} visitadas</span>
            <span>{counts.pendente ?? 0} pendentes</span>
            <span>{counts.tentativa ?? 0} tentativas</span>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-zinc-100 overflow-hidden">
            <div
              className="h-full bg-green-600 rounded-full transition-all"
              style={{ width: `${((counts.visitado ?? 0) / schools.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Busca */}
        <div className="px-3 pt-3">
          <input
            type="search"
            placeholder="Buscar escola..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filtros */}
        <div className="flex gap-1 px-3 py-2 flex-wrap">
          {STATUS_OPTIONS.map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                filter === s
                  ? 'bg-blue-600 text-white'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              {s === 'todos' ? `Todos (${schools.length})` : s}
            </button>
          ))}
        </div>

        {/* Lista */}
        <div className="flex-1 overflow-y-auto">
          <p className="px-4 py-2 text-xs text-zinc-400">
            {filtered.length} unidade{filtered.length !== 1 ? 's' : ''}
          </p>
          {filtered.map(({ school, distKm }) => (
            <SchoolCard
              key={school.sigla}
              school={school}
              visita={visitas[school.sigla]}
              distKm={distKm === Infinity ? undefined : distKm}
            />
          ))}
        </div>
      </aside>

      {/* Mapa */}
      <div ref={mapRef} className="flex-1" />
    </div>
  )
}
