import { useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'

import {
  getPersonalAccount,
  updatePersonalAccount,
} from '../lib/server/personal-account'

type PersonalAccount = {
  personalAccountId: string
  firstName: string
  lastName: string
  role: 'property_owner' | 'realtor'
  contactEmail: string | null
  bio: string | null
  createdAt: string
  updatedAt: string
}

export const Route = createFileRoute('/profile')({
  component: ProfilePage,
})

function ProfilePage() {
  const [profile, setProfile] = useState<PersonalAccount | null>(null)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [bio, setBio] = useState('')

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    async function loadProfile() {
      try {
        const result = await getPersonalAccount()

        if (!result) {
          setError('You are not signed in.')
          return
        }

        if (result.status === 404) {
          setError('Profile not found.')
          return
        }

        if (result.status !== 200) {
          setError('Failed to load profile.')
          return
        }

        const account = JSON.parse(result.body) as PersonalAccount

        setProfile(account)
        setFirstName(account.firstName)
        setLastName(account.lastName)
        setContactEmail(account.contactEmail ?? '')
        setBio(account.bio ?? '')
      } catch (error) {
        console.error(error)
        setError('Failed to load profile.')
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (isSaving) {
      return
    }

    setError('')
    setSuccess('')
    setIsSaving(true)

    try {
      const result = await updatePersonalAccount({
        data: {
          firstName,
          lastName,
          contactEmail: contactEmail || null,
          bio: bio || null,
        },
      })

      if (result.status !== 200) {
        throw new Error('Failed to update profile.')
      }

      const updatedProfile = JSON.parse(result.body) as PersonalAccount

      setProfile(updatedProfile)
      setFirstName(updatedProfile.firstName)
      setLastName(updatedProfile.lastName)
      setContactEmail(updatedProfile.contactEmail ?? '')
      setBio(updatedProfile.bio ?? '')

      setSuccess('Profile updated successfully.')
    } catch (error) {
      console.error(error)

      setError(
        error instanceof Error
          ? error.message
          : 'Failed to update profile.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <main>
        <h1>My Profile</h1>
        <p>Loading...</p>
      </main>
    )
  }

  if (error && !profile) {
    return (
      <main>
        <h1>My Profile</h1>
        <p>{error}</p>
      </main>
    )
  }

  if (!profile) {
    return null
  }

  return (
    <main>
      <h1>My Profile</h1>

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
            disabled={isSaving}
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
            disabled={isSaving}
          />
        </div>

        <div>
          <label htmlFor="role">Role</label>

          <input
            id="role"
            name="role"
            type="text"
            value={profile.role}
            disabled
          />
        </div>

        <div>
          <label htmlFor="contactEmail">Contact email</label>

          <input
            id="contactEmail"
            name="contactEmail"
            type="email"
            value={contactEmail}
            onChange={(event) => setContactEmail(event.target.value)}
            disabled={isSaving}
          />
        </div>

        <div>
          <label htmlFor="bio">Bio</label>

          <textarea
            id="bio"
            name="bio"
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            rows={5}
            disabled={isSaving}
          />
        </div>

        {error && <p>{error}</p>}

        {success && <p>{success}</p>}

        <button type="submit" disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </form>
    </main>
  )
}
