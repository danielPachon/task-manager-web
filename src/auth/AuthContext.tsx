import { useQueryClient } from '@tanstack/react-query'
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { configureAuth } from '../api/client'
import { authApi } from '../api/endpoints'
import type { AuthResponse, User } from '../api/types'
import { storage } from '../utils/storage'

const TOKEN_KEY = 'tm.token'
const USER_KEY = 'tm.user'

interface AuthContextValue {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function readStoredUser(): User | null {
  const raw = storage.get(USER_KEY)
  if (!raw || !storage.get(TOKEN_KEY)) return null
  try {
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [user, setUser] = useState<User | null>(readStoredUser)

  const logout = useCallback(() => {
    storage.remove(TOKEN_KEY)
    storage.remove(USER_KEY)
    queryClient.clear()
    setUser(null)
  }, [queryClient])

  // Configured during render (not in an effect) so child queries already send the token on first load
  configureAuth(() => storage.get(TOKEN_KEY), logout)

  const saveSession = useCallback(({ token, user }: AuthResponse) => {
    storage.set(TOKEN_KEY, token)
    storage.set(USER_KEY, JSON.stringify(user))
    setUser(user)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      logout,
      login: async (email, password) => saveSession(await authApi.login(email, password)),
      register: async (name, email, password) => saveSession(await authApi.register(name, email, password)),
    }),
    [user, logout, saveSession],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
