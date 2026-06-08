'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { SchoolCard } from './SchoolCard'
import { STATUS_DOT_COLOR } from './StatusBadge'
import { haversine } from '@/lib/schools'
import type { School } from '@/lib/schools'

const FALLBACK = { lat: -22.8697, lng: -43.3297 }

const STATUS_OPTIONS = ['todos', 'pendente', 'visitado', 'tentativa', 'reagendado'] as const

const MAPS_DARK_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#0a0a0a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0a0a0a' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#525252' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1a1a1a' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#262626' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#404040' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#262626' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#1a1a1a' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#050505' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#262626' }] },
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#1a1a1a' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#525252' }] },
]

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userMarker = useRef<any>(null)
  const userPosRef = useRef(FALLBACK)

  useEffect(() => {
    if (window.google?.maps) { setMapsReady(true); return }
    window.initMap = () => setMapsReady(true)
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}&callback=initMap&libraries=marker,places&v=beta`
    script.async = true
    document.head.appendChild(script)
  }, [])

  useEffect(() => {
    if (!mapsReady || !mapRef.current || mapInstance.current) return
    mapInstance.current = new window.google.maps.Map(mapRef.current, {
      center: userPosRef.current,
      zoom: userPosRef.current === FALLBACK ? 12 : 15,
      mapId: 'visitas_map',
      streetViewControl: false,
      mapTypeControl: false,
      zoomControl: true,
      fullscreenControl: false,
      styles: MAPS_DARK_STYLE,
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

    // Marcador de localização do usuário (se já tiver posição real)
    if (userPosRef.current !== FALLBACK) {
      const dot = document.createElement('div')
      dot.style.cssText = [
        'width:16px;height:16px;border-radius:50%;',
        'background:#4a9eff;',
        'border:3px solid #fff;',
        'box-shadow:0 0 0 4px rgba(74,158,255,0.25),0 2px 8px rgba(0,0,0,0.4);',
      ].join('')
      userMarker.current = new window.google.maps.marker.AdvancedMarkerElement({
        map: mapInstance.current,
        position: userPosRef.current,
        content: dot,
        title: 'Você está aqui',
        zIndex: 9999,
      })
    }

    schools.forEach(school => {
      if (!school.lat || !school.lng) return
      const color = getColor(school.sigla)
      const dot = document.createElement('div')
      dot.style.cssText = `width:12px;height:12px;border-radius:50%;background:${color};border:2px solid rgba(255,255,255,0.15);box-shadow:0 0 8px ${color}80;cursor:pointer;transition:transform .15s;`
      dot.onmouseenter = () => { dot.style.transform = 'scale(1.4)' }
      dot.onmouseleave = () => { dot.style.transform = 'scale(1)' }
      const marker = new window.google.maps.marker.AdvancedMarkerElement({
        map: mapInstance.current!,
        position: { lat: school.lat, lng: school.lng },
        content: dot,
        title: school.nome,
      })
      marker.addListener('gmp-click', () => {
        window.location.href = `/escolas/${encodeURIComponent(school.sigla)}`
      })
      markers.current[school.sigla] = { marker, dot }
    })
  }

  useEffect(() => {
    Object.entries(markers.current).forEach(([sigla, { dot }]) => {
      const color = getColor(sigla)
      dot.style.background = color
      dot.style.boxShadow = `0 0 8px ${color}80`
    })
  }, [getColor])

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(pos => {
      const { latitude: lat, longitude: lng } = pos.coords
      userPosRef.current = { lat, lng }
      setUserPos({ lat, lng })

      // Se o mapa já foi inicializado, aplica imediatamente
      if (mapInstance.current) {
        if (userMarker.current) userMarker.current.map = null

        const dot = document.createElement('div')
        dot.style.cssText = [
          'width:16px;height:16px;border-radius:50%;',
          'background:#4a9eff;',
          'border:3px solid #fff;',
          'box-shadow:0 0 0 4px rgba(74,158,255,0.25),0 2px 8px rgba(0,0,0,0.4);',
        ].join('')

        userMarker.current = new window.google.maps.marker.AdvancedMarkerElement({
          map: mapInstance.current,
          position: { lat, lng },
          content: dot,
          title: 'Você está aqui',
          zIndex: 9999,
        })

        mapInstance.current.panTo({ lat, lng })
        mapInstance.current.setZoom(15)
      }
      // Se o mapa ainda não existe, o useEffect de init vai usar userPosRef.current
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

  const visitadoPct = Math.round(((counts.visitado ?? 0) / schools.length) * 100)

  return (
    <div className="p-4 lg:p-6 space-y-4">
      {/* Stats + filtros */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Visitadas — hero stat */}
        <div className="col-span-2 rounded-[28px] bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-[#262626] p-6 flex items-end justify-between">
          <div>
            <p className="text-xs text-[#737373] uppercase tracking-widest mb-1">Visitadas</p>
            <p className="font-display text-6xl font-bold text-[#ccf381] tracking-tighter leading-none">
              {counts.visitado ?? 0}
            </p>
            <p className="text-xs text-[#525252] mt-2">de {schools.length} escolas · {visitadoPct}%</p>
          </div>
          {/* Mini progress arc */}
          <div className="flex flex-col items-end gap-1.5 text-xs text-[#525252]">
            <span><span className="text-red-400">●</span> {counts.pendente ?? 0} pendentes</span>
            <span><span className="text-yellow-400">●</span> {counts.tentativa ?? 0} tentativas</span>
            <span><span className="text-violet-400">●</span> {counts.reagendado ?? 0} reagendados</span>
          </div>
        </div>

        {/* Busca + filtros */}
        <div className="col-span-2 rounded-[28px] bg-[#0a0a0a] border border-[#262626] p-5 flex flex-col gap-3">
          <input
            type="search"
            placeholder="Buscar escola, bairro..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#121212] border border-[#262626] focus:border-[#ccf381] rounded-xl px-4 py-2.5 text-sm text-[#fafafa] placeholder-[#525252] outline-none transition-colors"
          />
          <div className="flex gap-2 flex-wrap">
            {STATUS_OPTIONS.map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  filter === s
                    ? 'bg-[#ccf381] text-black'
                    : 'bg-[#121212] text-[#737373] border border-[#262626] hover:border-[#404040] hover:text-[#fafafa]'
                }`}
              >
                {s === 'todos' ? `Todos (${filtered.length})` : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
          {/* Progress bar */}
          <div className="h-1 rounded-full bg-[#1a1a1a] overflow-hidden mt-auto">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${visitadoPct}%`, background: '#ccf381' }}
            />
          </div>
        </div>
      </div>

      {/* Mapa + Lista lado a lado */}
      <div className="flex flex-col md:flex-row gap-4" style={{ height: 'clamp(400px, 65vh, 680px)' }}>
        {/* Mapa */}
        <div className="rounded-[28px] overflow-hidden border border-[#262626] flex-shrink-0 md:w-[380px] h-64 md:h-full">
          <div ref={mapRef} className="w-full h-full" />
        </div>

        {/* Lista de escolas */}
        <div className="flex-1 flex flex-col min-h-0">
          <p className="text-xs text-[#525252] mb-3 px-1 flex-shrink-0">
            {filtered.length} unidade{filtered.length !== 1 ? 's' : ''}
          </p>
          <div className="flex-1 overflow-y-auto pr-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {filtered.map(({ school, distKm }) => (
                <SchoolCard
                  key={school.sigla}
                  school={school}
                  visita={visitas[school.sigla]}
                  distKm={distKm === Infinity ? undefined : distKm}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
