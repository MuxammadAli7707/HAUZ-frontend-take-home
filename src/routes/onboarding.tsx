import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'

import { createPersonalAccount } from '../lib/server/personal-account'

export const Route = createFileRoute('/onboarding')({
  component: OnboardingPage,
})

function OnboardingPage() {
  const navigate = useNavigate()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [role, setRole] = useState<'property_owner' | 'realtor'>(
    'property_owner',
  )

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (isSubmitting) {
      return
    }

    setError('')
    setIsSubmitting(true)

    try {
      const result = await createPersonalAccount({
        data: {
          firstName,
          lastName,
          role,
        },
      })

      if (result.status !== 200 && result.status !== 201) {
        throw new Error('Failed to create personal account')
      }

      navigate({ to: '/' })
    } catch (error) {
      console.error(error)

      setError(
        error instanceof Error
          ? error.message
          : 'Something went wrong. Please try again.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main>
      <h1>Welcome to HAUZ</h1>

      <p>Tell us a little about yourself.</p>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="firstName">First name</label>

          <input
            id="firstName"
            name="firstName"
            type="text"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label htmlFor="lastName">Last name</label>

          <input
            id="lastName"
            name="lastName"
            type="text"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label htmlFor="role">Role</label>

          <select
            id="role"
            name="role"
            value={role}
            onChange={(event) =>
              setRole(event.target.value as 'property_owner' | 'realtor')
            }
            disabled={isSubmitting}
          >
            <option value="property_owner">Property owner</option>
            <option value="realtor">Realtor</option>
          </select>
        </div>

        {error && <p>{error}</p>}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account...' : 'Continue'}
        </button>
      </form>
    </main>
  )
}
