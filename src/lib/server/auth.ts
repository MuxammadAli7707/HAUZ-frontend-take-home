import { ID } from 'node-appwrite'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import {
  deletePendingEmailToken,
  getPendingEmailToken,
  savePendingEmailToken,
} from './pending-email-tokens'
import {
  createAppwriteAccount,
  createSessionAccount,
  deleteSessionCookie,
  getSessionSecret,
  setSessionSecret,
} from './session'

const emailSchema = z.object({
  email: z.string().trim().email(),
})

export const sendEmailCode = createServerFn({ method: 'POST' })
  .inputValidator(emailSchema)
  .handler(async ({ data }) => {
    const account = createAppwriteAccount()

    const token = await account.createEmailToken({
      userId: ID.unique(),
      email: data.email,
    })

    savePendingEmailToken(data.email, token.userId, token.secret)

    return {
      userId: token.userId,
    }
  })

const verifyEmailCodeSchema = z.object({
  email: z.string().trim().email(),
  code: z.string().trim().min(1),
})

export const verifyEmailCode = createServerFn({ method: 'POST' })
  .inputValidator(verifyEmailCodeSchema)
  .handler(async ({ data }) => {
    const pendingToken = getPendingEmailToken(data.email)

    if (!pendingToken) {
      throw new Error('Verification code expired or not found')
    }

    const account = createAppwriteAccount()

    const session = await account.createSession({
      userId: pendingToken.userId,
      secret: data.code,
    })

    setSessionSecret(session.secret)

    deletePendingEmailToken(data.email)

    return {
      userId: session.userId,
    }
  })

  export const getCurrentUser = createServerFn({
    method: 'GET',
  }).handler(async () => {
    const sessionSecret = getSessionSecret()
  
    if (!sessionSecret) {
      return null
    }
  
    try {
      const account = createSessionAccount(sessionSecret)
      const user = await account.get()
  
      return {
        id: user.$id,
        email: user.email,
        name: user.name,
      }
    } catch (error) {
      console.error('GET CURRENT USER ERROR:', error)
  
      deleteSessionCookie()
      return null
    }
  })