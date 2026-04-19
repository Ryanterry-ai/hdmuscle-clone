bash

cat > /home/claude/hdmuscle-cms/lib/prisma.ts << 'EOF'
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
EOF

cat > /home/claude/hdmuscle-cms/lib/session.ts << 'EOF'
import { IronSessionOptions } from 'iron-session'
import { AdminRole } from '@prisma/client'

export interface SessionData {
  adminId: string
  role: AdminRole
  siteIds: string[]
  activeSiteId: string
  name: string
  email: string
}

export const sessionOptions: IronSessionOptions = {
  cookieName: process.env.SESSION_COOKIE_NAME ?? 'cms_session',
  password: process.env.SESSION_SECRET ?? 'fallback-secret-32-chars-minimum!!',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 8 * 60 * 60, // 8 hours
  },
}

declare module 'iron-session' {
  interface IronSessionData extends SessionData {}
}
EOF

cat > /home/claude/hdmuscle-cms/lib/money.ts << 'EOF'
export function paiseToCurrency(paise: number, currency = 'INR'): string {
  return (paise / 100).toLocaleString('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
}

export function currencyToPaise(amount: number): number {
  return Math.round(amount * 100)
}

export function formatPrice(paise: number): string {
  return paiseToCurrency(paise)
}
EOF

cat > /home/claude/hdmuscle-cms/lib/slug.ts << 'EOF'
import { prisma } from './prisma'

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100)
}

export async function ensureUniqueSlug(
  base: string,
  siteId: string,
  model: 'product' | 'collection' | 'page' | 'blogPost',
  existingId?: string
): Promise<string> {
  let slug = generateSlug(base)
  let suffix = 1

  while (true) {
    const candidate = suffix === 1 ? slug : `${slug}-${suffix}`
    // @ts-ignore — dynamic model access
    const existing = await (prisma[model] as any).findUnique({
      where: { siteId_slug: { siteId, slug: candidate } },
      select: { id: true },
    })
    if (!existing || existing.id === existingId) return candidate
    suffix++
  }
}
EOF

echo "core lib files created"
