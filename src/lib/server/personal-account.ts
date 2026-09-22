import { ExecutionMethod, Functions } from 'node-appwrite'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { createAppwriteSessionClient } from './appwrite'
import { getCurrentUser } from './auth'
import { getSessionSecret } from './session'

export const getPersonalAccount = createServerFn({
  method: 'GET',
}).handler(async () => {
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  const functionId = process.env.APPWRITE_FUNCTION_ID

  if (!functionId) {
    throw new Error('Missing APPWRITE_FUNCTION_ID')
  }

  const sessionSecret = getSessionSecret()

  if (!sessionSecret) {
    return null
  }

  const client = createAppwriteSessionClient(sessionSecret)
  const functions = new Functions(client)

  const execution = await functions.createExecution({
    functionId,
    body: JSON.stringify({}),
    method: ExecutionMethod.GET,
    xpath: '/personal-account',
  })

  return {
    status: execution.responseStatusCode,
    body: execution.responseBody,
  }
})

const createPersonalAccountSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  role: z.enum(['property_owner', 'realtor']),
})

export const createPersonalAccount = createServerFn({
  method: 'POST',
})
  .inputValidator(createPersonalAccountSchema)
  .handler(async ({ data }) => {
    const user = await getCurrentUser()

    if (!user) {
      throw new Error('Not authenticated')
    }

    const functionId = process.env.APPWRITE_FUNCTION_ID

    if (!functionId) {
      throw new Error('Missing APPWRITE_FUNCTION_ID')
    }

    const sessionSecret = getSessionSecret()

    if (!sessionSecret) {
      throw new Error('Missing session')
    }

    const client = createAppwriteSessionClient(sessionSecret)
    const functions = new Functions(client)

    const execution = await functions.createExecution({
      functionId,
      body: JSON.stringify({
        userId: user.id,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
      }),
      method: ExecutionMethod.POST,
      xpath: '/personal-account',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    return {
      status: execution.responseStatusCode,
      body: execution.responseBody,
    }
  })