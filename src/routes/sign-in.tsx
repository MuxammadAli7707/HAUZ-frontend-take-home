import { useEffect, useState } from 'react'
import {
  createFileRoute,
  useNavigate,
  useRouter,
  useSearch,
} from '@tanstack/react-router'

import {
  getCurrentUser,
  sendEmailCode,
  verifyEmailCode,
} from '../lib/server/auth'
import { getPersonalAccount } from '../lib/server/personal-account'

export const Route = createFileRoute('/sign-in')({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect:
      typeof search.redirect === 'string' ? search.redirect : undefined,
  }),
  component: SignInPage,
})

function SignInPage() {
  const navigate = useNavigate()
  const router = useRouter()
  const { redirect } = useSearch({
    from: '/sign-in',
  })

  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [isCodeSent, setIsCodeSent] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function checkCurrentUser() {
      const user = await getCurrentUser()

      if (!user) {
        return
      }

      const personalAccount = await getPersonalAccount()

      if (personalAccount?.status === 404) {
        navigate({ to: '/onboarding' })
        return
      }
    
      if (personalAccount?.status === 200) {
        if (redirect) {
          navigate({ to: redirect })
          return
        }
    
        navigate({ to: '/profile' })
        return
      }
    }

    checkCurrentUser()
  }, [navigate, redirect])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (isSubmitting) {
      return
    }

    setError('')
    setIsSubmitting(true)

    try {
      if (!isCodeSent) {
        await sendEmailCode({
          data: {
            email,
          },
        })

        setIsCodeSent(true)
        return
      }

      await verifyEmailCode({
        data: {
          email,
          code,
        },
      })
      await router.invalidate()

      const personalAccount = await getPersonalAccount()
      
      if (personalAccount?.status === 404) {
        navigate({ to: '/onboarding' })
        return
      }
      
      if (personalAccount?.status === 200) {
        if (redirect) {
          navigate({ to: redirect })
          return
        }
      
        navigate({ to: '/profile' })
        return
      }
      
      throw new Error('Failed to load personal account')
    } catch (error) {
      console.error(error)

      setError(
        isCodeSent
          ? 'Неверный код или срок действия кода истёк.'
          : 'Не удалось отправить код. Проверьте email и попробуйте снова.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main>
      <h1>Sign in</h1>

      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email</label>

        <input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={isCodeSent || isSubmitting}
          required
        />

        {!isCodeSent ? (
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Sending...' : 'Get code'}
          </button>
        ) : (
          <>
            <label htmlFor="code">Verification code</label>

            <input
              id="code"
              name="code"
              type="text"
              inputMode="numeric"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="Enter code"
              disabled={isSubmitting}
              required
            />

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Checking...' : 'Sign in'}
            </button>
          </>
        )}

        {error && <p>{error}</p>}
      </form>
    </main>
  )
}
