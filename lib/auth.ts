export function verifyAdminKey(providedKey: string): boolean {
  const adminKey = process.env.ADMIN_API_KEY
  if (!adminKey) {
    console.error("[v0] ADMIN_API_KEY not configured")
    return false
  }
  return providedKey === adminKey
}

export function extractApiKey(request: Request): string | null {
  const authHeader = request.headers.get("Authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null
  }
  return authHeader.substring(7)
}
