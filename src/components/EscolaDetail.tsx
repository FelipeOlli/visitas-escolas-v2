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
      <dt className="text-[10px] font-medium text-[#525252] uppercase tracking-widest mb-0.5">{label}</dt>
      <dd className="text-sm text-[#a3a3a3]">{value}</dd>
    </div>
  )
}

const inputClass = 'w-full bg-[#0a0a0a] border border-[#262626] focus:border-[#ccf381] rounded-xl px-3 py-2.5 text-sm text-[#fafafa] placeholder-[#525252] outline-none transition-colors'
const labelClass = 'block text-[10px] font-medium text-[#525252] uppercase tracking-widest mb-1.5'

export function EscolaDetail({ school, visita }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')
  const [toastOk, setToastOk] = useState(true)
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
    setToastOk(res.ok)
    setToast(res.ok ? 'Visita salva com sucesso!' : 'Erro ao salvar.')
    if (res.ok) router.refresh()
    setTimeout(() => setToast(''), 3000)
  }

  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${school.endereco}, ${school.bairro}, Rio de Janeiro`)}`

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto space-y-4">
      {/* Voltar */}
      <Link href="/escolas" className="inline-flex items-center gap-1.5 text-xs text-[#525252] hover:text-[#ccf381] transition-colors">
        ← Voltar
      </Link>

      {/* Bento topo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Hero da escola */}
        <div className="md:col-span-2 rounded-[28px] bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-[#262626] p-7 flex flex-col justify-between min-h-[220px]">
          <div>
            <StatusBadge status={status} />
            <h1 className="font-display text-2xl md:text-3xl font-bold text-[#fafafa] tracking-tight leading-tight mt-3">
              {school.nome}
            </h1>
            {visita && (
              <p className="text-xs text-[#525252] mt-2">
                atualizado por <span className="text-[#737373]">{visita.user.name}</span>{' '}
                em {new Date(visita.updatedAt).toLocaleDateString('pt-BR')}
              </p>
            )}
          </div>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-6 self-start inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#ccf381] text-black text-xs font-semibold hover:bg-[#b8e060] transition-colors"
          >
            Traçar rota →
          </a>
        </div>

        {/* Dados da escola */}
        <div className="rounded-[28px] bg-[#0a0a0a] border border-[#262626] p-6">
          <p className="text-[10px] text-[#525252] uppercase tracking-widest mb-4">Informações</p>
          <dl className="space-y-3">
            <Field label="Sigla"    value={school.sigla} />
            <Field label="ID Setor" value={school.id_setor} />
            <Field label="CRE"      value={cre} />
            <Field label="Endereço" value={school.endereco} />
            <Field label="Bairro"   value={school.bairro} />
            <Field label="CEP"      value={school.cep} />
            <Field label="Telefone" value={school.telefone} />
            <Field label="E-mail"   value={school.email} />
          </dl>
        </div>
      </div>

      {/* Formulário de visita */}
      <div className="rounded-[28px] bg-[#0a0a0a] border border-[#262626] p-6 lg:p-8">
        <h2 className="font-display text-base font-semibold text-[#fafafa] mb-6">Registrar visita</h2>

        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className={inputClass}
                style={{ colorScheme: 'dark' }}
              >
                {STATUS_OPTIONS.map(s => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Data e Hora</label>
              <input
                type="datetime-local"
                value={dataHora}
                onChange={e => setDataHora(e.target.value)}
                className={inputClass}
                style={{ colorScheme: 'dark' }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Contato atendido</label>
              <input
                type="text"
                value={contato}
                onChange={e => setContato(e.target.value)}
                placeholder="Nome..."
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Telefone do contato</label>
              <input
                type="tel"
                value={contatoTel}
                onChange={e => setContatoTel(e.target.value)}
                placeholder="(21) 9..."
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Observações</label>
            <textarea
              value={obs}
              onChange={e => setObs(e.target.value)}
              rows={4}
              placeholder="O que foi discutido, pontos de atenção..."
              className={`${inputClass} resize-none`}
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            {toast && (
              <div className={`text-xs px-4 py-2 rounded-xl border ${
                toastOk
                  ? 'bg-[#ccf381]/10 text-[#ccf381] border-[#ccf381]/20'
                  : 'bg-red-500/10 text-red-400 border-red-500/20'
              }`}>
                {toast}
              </div>
            )}
            <button
              type="submit"
              disabled={saving}
              className="ml-auto bg-[#ccf381] hover:bg-[#b8e060] disabled:opacity-40 text-black font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors"
            >
              {saving ? 'Salvando...' : 'Salvar visita'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
