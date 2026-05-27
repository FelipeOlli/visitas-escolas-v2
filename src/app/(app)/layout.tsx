import { auth } from '@/lib/auth'
import { signOut } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/login')

  return (
    <div className="flex flex-col min-h-screen bg-[#050505]">
      <header className="flex items-center justify-between px-6 py-4 border-b border-[#262626] shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#ccf381]" />
          <span className="font-display font-semibold text-[#fafafa] text-sm tracking-tight">
            Visitas Escolas RJ
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#121212] border border-[#262626]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ccf381]" />
            <span className="text-xs text-[#a3a3a3]">{session.user?.name}</span>
          </div>
          <form
            action={async () => {
              'use server'
              await signOut({ redirectTo: '/login' })
            }}
          >
            <button className="text-xs text-[#737373] hover:text-[#fafafa] transition-colors px-2 py-1.5">
              Sair
            </button>
          </form>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  )
}
