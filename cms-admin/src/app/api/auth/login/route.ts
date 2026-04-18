import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import {
  createSessionToken,
  DEFAULT_SESSION_MAX_AGE,
  SESSION_COOKIE_NAME,
} from '@/lib/auth';

const THIRTY_DAYS = 60 * 60 * 24 * 30;

export async function POST(request: NextRequest) {
  try {
    const { email, password, rememberMe = false } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const maxAge = rememberMe ? THIRTY_DAYS : DEFAULT_SESSION_MAX_AGE;
    const token = await createSessionToken(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      maxAge
    );

    const response = NextResponse.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge,
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
