import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const { name, email, password } = await req.json()

  if (!name || !email || !password) {
    return NextResponse.json({ error: 'Campos obrigatórios faltando.' }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: 'E-mail já cadastrado.' }, { status: 409 })
  }

  const hashed = await hash(password, 12)
  const user = await prisma.user.create({ data: { name, email, password: hashed } })

  return NextResponse.json({ id: user.id, name: user.name, email: user.email }, { status: 201 })
}
