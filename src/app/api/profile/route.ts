import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import bcrypt from 'bcrypt';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      is_active: true,
      created_at: true,
      updated_at: true,
    },
  });
  if (!user) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json(user);
}

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { email, name, password } = body as {
      email?: string;
      name?: string;
      password?: string;
    };
    const data: any = {};
    if (typeof name === 'string' && name.trim().length > 0) {
      data.name = name.trim();
    }
    if (typeof email === 'string' && email.trim().length > 0) {
      const exists = await prisma.user.findUnique({ where: { email } });
      if (exists && exists.id !== session.id) {
        return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
      }
      data.email = email.trim();
    }
    if (typeof password === 'string' && password.trim().length >= 6) {
      data.password_hash = await bcrypt.hash(password, 10);
    }
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'No changes' }, { status: 400 });
    }
    const updated = await prisma.user.update({
      where: { id: session.id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        is_active: true,
        created_at: true,
        updated_at: true,
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
