import { Account } from 'node-appwrite'
import {
  getCookie,
  setCookie,
  deleteCookie,
} from '@tanstack/react-start/server'

import {
  createAppwriteAdminClient,
  createAppwriteSessionClient,
} from './appwrite'

const SESSION_COOKIE = 'hauz_session'

export function createAppwriteAccount() {
  const client = createAppwriteAdminClient()

  return new Account(client)
}

export function createSessionAccount(sessionSecret: string) {
  const client = createAppwriteSessionClient(sessionSecret)

  return new Account(client)
}

export function getSessionSecret() {
  return getCookie(SESSION_COOKIE)
}

export function setSessionSecret(secret: string) {
  setCookie('hauz_session', secret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  })

}

export function deleteSessionCookie() {
  deleteCookie(SESSION_COOKIE, {
    path: '/',
  })
}