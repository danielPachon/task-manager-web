export const API_URL: string =
  import.meta.env.VITE_API_URL ?? 'https://task-manager-api-0uhq.onrender.com/api/v1'

/** Error returned by the API, with field-level validation details when available. */
export class ApiError extends Error {
  readonly status: number
  readonly details?: Record<string, string[]>

  constructor(status: number, message: string, details?: Record<string, string[]>) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

type Listener = (slow: boolean) => void

/**
 * Tracks requests that take longer than SLOW_MS so the UI can explain
 * that the free-tier server is waking up instead of looking frozen.
 */
const SLOW_MS = 3000
let pendingSlow = 0
const listeners = new Set<Listener>()

export function onSlowRequests(listener: Listener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

const emit = () => listeners.forEach((l) => l(pendingSlow > 0))

let tokenProvider: () => string | null = () => null
let onUnauthorized: () => void = () => {}

export function configureAuth(getToken: () => string | null, handleUnauthorized: () => void) {
  tokenProvider = getToken
  onUnauthorized = handleUnauthorized
}

export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  if (init.body) headers.set('Content-Type', 'application/json')
  const token = tokenProvider()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  let markedSlow = false
  const timer = setTimeout(() => {
    markedSlow = true
    pendingSlow += 1
    emit()
  }, SLOW_MS)

  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, { ...init, headers })
  } catch {
    throw new ApiError(0, 'Could not reach the server. Check your connection and try again.')
  } finally {
    clearTimeout(timer)
    if (markedSlow) {
      pendingSlow -= 1
      emit()
    }
  }

  if (response.status === 204) return undefined as T

  const body = await response.json().catch(() => null)
  if (!response.ok) {
    if (response.status === 401 && token) onUnauthorized()
    throw new ApiError(
      response.status,
      body?.error?.message ?? `Request failed with status ${response.status}`,
      body?.error?.details,
    )
  }
  return body as T
}
