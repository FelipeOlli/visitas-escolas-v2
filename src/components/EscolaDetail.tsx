'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getCre } from '@/lib/schools'
import { StatusBadge } from './StatusBadge'
import type { School } from '@/lib/schools'

interface Visita {
  id: string
  sigla: string
  status: string
  dataHora: Date | null
  contato: string | null
  contatoTel: string | null
  obs: string | null
  updatedAt: Date
  user: { name: string }
}

interface Props {
  school: School
  visita: Visita | null
}

const STATUS_OPTIONS = ['pendente', 'visitado', 'tentativa', 'reagendado'] as const

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div>
      <dt className="text-xs font-medium text-zinc-400 uppercase tracking-wide">{label}</dt>
      <dd className="mt-0.5 text-sm text-zinc-800">{value}</dd>
    </div>
  )
}

export function EscolaDetail({ school, visita }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')
  const [status, setStatus] = useState(visita?.status ?? 'pendente')
  const [dataHora, setDataHora] = useState(
    visita?.dataHora ? new Date(visita.dataHora).toISOString().slice(0, 16) : ''
  )
  const [contato, setContato] = useState(visita?.contato ?? '')
  const [contatoTel, setContatoTel] = useState(visita?.contatoTel ?? '')
  const [obs, setObs] = useState(visita?.obs ?? '')

  const cre = getCre(school.sigla)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const res = await fetch(`/api/visitas/${encodeURIComponent(school.sigla)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, dataHora: dataHora || null, contato, contatoTel, obs }),
    })
    setSaving(false)
    if (res.ok) {
      setToast('Visita salva!')
      router.refresh()
      setTimeout(() => setToast(''), 3000)
    } else {
      setToast('Erro ao salvar.')
      setTimeout(() => setToast(''), 3000)
    }
  }

  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${school.endereco}, ${school.bairro}, Rio de Janeiro`)}`

  return (
    <div className="max-w-4xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Voltar */}
      <div className="col-span-full">
        <Link href="/escolas" className="text-sm text-blue-600 hover:underline">
          ← Voltar à lista
        </Link>
      </div>

      {/* Dados da escola */}
      <div className="bg-white rounded-xl border border-zinc-200 p-6">
        <h1 className="text-lg font-semibold text-zinc-900 mb-1">{school.nome}</h1>
        <div className="flex items-center gap-2 mb-5">
          <StatusBadge status={status} />
          {visita && (
            <span className="text-xs text-zinc-400">
              atualizado por {visita.user.name} em {new Date(visita.updatedAt).toLocaleDateString('pt-BR')}
            </span>
          )}
        </div>

        <dl className="space-y-3">
          <Field label="Sigla"      value={school.sigla} />
          <Field label="ID Setor"   value={school.id_setor} />
          <Field label="CRE"        value={cre} />
          <Field label="Endereço"   value={school.endereco} />
          <Field label="Bairro"     value={school.bairro} />
          <Field label="CEP"        value={school.cep} />
          <Field label="Telefone"   value={school.telefone} />
          <Field label="E-mail"     value={school.email} />
        </dl>

        <a
          href={mapsUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
        >
          Traçar rota no Google Maps →
        </a>
      </div>

      {/* Formulário de visita */}
      <div className="bg-white rounded-xl border border-zinc-200 p-6">
        <h2 className="text-base font-semibold text-zinc-900 mb-4">Registrar visita</h2>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1">Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {STATUS_OPTIONS.map(s => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1">Data e Hora</label>
              <input
                type="datetime-local"
                value={dataHora}
                onChange={e => setDataHora(e.target.value)}
                className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1">Contato atendido</label>
              <input
                type="text"
                value={contato}
                onChange={e => setContato(e.target.value)}
                placeholder="Nome..."
                className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1">Telefone do contato</label>
              <input
                type="tel"
                value={contatoTel}
                onChange={e => setContatoTel(e.target.value)}
                placeholder="(21) 9..."
                className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1">Observações</label>
            <textarea
              value={obs}
              onChange={e => setObs(e.target.value)}
              rows={4}
              placeholder="O que foi discutido, pontos de atenção..."
              className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            {toast && (
              <span className={`text-sm ${toast.includes('Erro') ? 'text-red-600' : 'text-green-600'}`}>
                {toast}
              </span>
            )}
            <button
              type="submit"
              disabled={saving}
              className="ml-auto bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {saving ? 'Salvando...' : 'Salvar visita'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
