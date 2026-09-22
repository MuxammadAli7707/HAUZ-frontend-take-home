import { Client } from 'node-appwrite'

function getEnv(name: string): string {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`)
  }

  return value
}

const endpoint = getEnv('APPWRITE_ENDPOINT')
const projectId = getEnv('APPWRITE_PROJECT_ID')
const apiKey = getEnv('APPWRITE_API_KEY')

function createBaseClient() {
  return new Client()
    .setEndpoint(endpoint)
    .setProject(projectId)
}

export function createAppwriteAdminClient() {
  return createBaseClient().setKey(apiKey)
}

export function createAppwriteSessionClient(sessionSecret: string) {
  return createBaseClient().setSession(sessionSecret)
}