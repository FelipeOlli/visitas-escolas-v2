import { auth } from '@/lib/auth'
import { signOut } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/login')

  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-zinc-200 shrink-0">
        <div>
          <span className="font-semibold text-zinc-900 text-sm">Visitas Escolas RJ</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-zinc-500">{session.user?.name}</span>
          <form
            action={async () => {
              'use server'
              await signOut({ redirectTo: '/login' })
            }}
          >
            <button className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
              Sair
            </button>
          </form>
        </div>
      </header>
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  )
}
