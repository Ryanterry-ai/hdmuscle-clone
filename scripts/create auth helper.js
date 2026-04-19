bash

cat > /home/claude/hdmuscle-cms/lib/auth.ts << 'EOF'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { sessionOptions, SessionData } from './session'
import { AdminRole } from '@prisma/client'
import { prisma } from './prisma'

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

export function errorResponse(error: unknown) {
  if (error instanceof ApiError) {
    return Response.json({ error: error.message }, { status: error.status })
  }
  console.error(error)
  return Response.json({ error: 'Internal server error' }, { status: 500 })
}

export async function getAdminSession(): Promise<SessionData | null> {
  try {
    const cookieStore = cookies()
    const session = await getIronSession<SessionData>(cookieStore as any, sessionOptions)
    if (!session.adminId) return null
    return session as SessionData
  } catch {
    return null
  }
}

export async function requireAdminSession(): Promise<SessionData> {
  const session = await getAdminSession()
  if (!session) throw new ApiError(401, 'Unauthorized')
  return session
}

export async function requireSiteAccess(session: SessionData, siteId: string): Promise<void> {
  if (session.role === 'SUPER_ADMIN') return
  if (!session.siteIds.includes(siteId)) throw new ApiError(403, 'Forbidden')
}

export function requireRole(session: SessionData, minRole: AdminRole): void {
  const hierarchy: AdminRole[] = ['VIEWER', 'EDITOR', 'SITE_ADMIN', 'SUPER_ADMIN']
  const sessionLevel = hierarchy.indexOf(session.role)
  const requiredLevel = hierarchy.indexOf(minRole)
  if (sessionLevel < requiredLevel) throw new ApiError(403, 'Insufficient permissions')
}

export async function requireModuleEnabled(siteId: string, module: string): Promise<void> {
  const site = await prisma.site.findUnique({
    where: { id: siteId },
    select: { enabledModules: true },
  })
  if (!site) throw new ApiError(404, 'Site not found')
  if (!site.enabledModules.includes(module)) {
    throw new ApiError(403, `Module '${module}' is not enabled for this site`)
  }
}

export function getSiteIdFromRequest(request: Request): string | null {
  const url = new URL(request.url)
  const siteId = url.searchParams.get('siteId')
  if (siteId) return siteId
  const domain = request.headers.get('x-site-domain')
  return domain
}
EOF
echo "auth done"
