import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcrypt'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getSession()
    if (!session || session.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const users = await prisma.user.findMany({
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        is_active: true,
        created_at: true,
      },
    })
    return NextResponse.json(users)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const body = await req.json()
    const { email, name, password, role } = body as {
      email: string
      name: string
      password: string
      role: 'admin' | 'agent' | 'super_admin'
    }
    if (!email || !name || !password || !role) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }
    if (!['admin', 'agent', 'super_admin'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 })
    }
    const password_hash = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { email, name, password_hash, role, is_active: true },
    })
    const { password_hash: _, ...userWithoutPassword } = user
    return NextResponse.json(userWithoutPassword, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
