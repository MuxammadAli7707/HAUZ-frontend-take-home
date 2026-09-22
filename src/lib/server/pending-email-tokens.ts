type PendingEmailToken = {
  userId: string
  secret: string
  expiresAt: number
}

const pendingTokens = new Map<string, PendingEmailToken>()

const TOKEN_TTL_MS = 15 * 60 * 1000

export function savePendingEmailToken(
  email: string,
  userId: string,
  secret: string,
) {
  pendingTokens.set(email, {
    userId,
    secret,
    expiresAt: Date.now() + TOKEN_TTL_MS,
  })
}

export function getPendingEmailToken(email: string) {
  const token = pendingTokens.get(email)

  if (!token) {
    return null
  }

  if (token.expiresAt < Date.now()) {
    pendingTokens.delete(email)
    return null
  }

  return token
}

export function deletePendingEmailToken(email: string) {
  pendingTokens.delete(email)
}