'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const inputClass = 'w-full bg-[#121212] border border-[#262626] focus:border-[#ccf381] rounded-xl px-4 py-3 text-sm text-[#fafafa] placeholder-[#525252] outline-none transition-colors'
const labelClass = 'block text-[10px] font-medium text-[#525252] uppercase tracking-widest mb-1.5'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const fd = new FormData(e.currentTarget)

    const res = await signIn('credentials', {
      email:    fd.get('email'),
      password: fd.get('password'),
      redirect: false,
    })

    setLoading(false)
    if (res?.error) {
      setError('E-mail ou senha incorretos.')
    } else {
      router.push('/escolas')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-2 justify-center mb-8">
          <span className="w-2 h-2 rounded-full bg-[#ccf381]" />
          <span className="font-display text-sm font-semibold text-[#fafafa] tracking-tight">
            Visitas Escolas RJ
          </span>
        </div>

        <div className="rounded-[32px] bg-[#0a0a0a] border border-[#262626] p-8">
          <h1 className="font-display text-2xl font-bold text-[#fafafa] tracking-tight mb-1">Entrar</h1>
          <p className="text-xs text-[#525252] mb-7">Controle de visitas às unidades escolares</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelClass}>E-mail</label>
              <input name="email" type="email" required autoComplete="email" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Senha</label>
              <input name="password" type="password" required autoComplete="current-password" className={inputClass} />
            </div>

            {error && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#ccf381] hover:bg-[#b8e060] disabled:opacity-40 text-black font-semibold py-3 rounded-xl text-sm transition-colors mt-2"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p className="mt-6 text-xs text-center text-[#525252]">
            Sem conta?{' '}
            <Link href="/register" className="text-[#ccf381] hover:underline">
              Criar conta
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
