import type { QueryClient } from '@tanstack/react-query'
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'

import appCss from '../styles.css?url'
import { getCurrentUser, logout } from '../lib/server/auth'

export interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  loader: () => getCurrentUser(),

  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'HAUZ' },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),

  component: RootLayout,
  shellComponent: RootDocument,
})

function RootLayout() {
  const user = Route.useLoaderData()

  async function handleLogout() {
    await logout()
    window.location.href = '/sign-in'
  }

  return (
    <>
      <header>
        <a href="/">HAUZ</a>

        {user ? (
          <div>
            <span>{user.name || user.email}</span>
            <button type="button" onClick={handleLogout}>Log out</button>
          </div>
        ) : (
          <a href="/sign-in">Sign in</a>
        )}
      </header>

      <main>
        <Outlet />
      </main>
    </>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}