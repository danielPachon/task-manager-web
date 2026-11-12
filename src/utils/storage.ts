/** localStorage can throw in private windows or when blocked, so every access is guarded. */
export const storage = {
  get(key: string): string | null {
    try {
      return window.localStorage.getItem(key)
    } catch {
      return null
    }
  },
  set(key: string, value: string) {
    try {
      window.localStorage.setItem(key, value)
    } catch {
      /* ignore */
    }
  },
  getSession(key: string): string | null {
    try {
      return window.sessionStorage.getItem(key)
    } catch {
      return null
    }
  },
  setSession(key: string, value: string) {
    try {
      window.sessionStorage.setItem(key, value)
    } catch {
      /* ignore */
    }
  },
  remove(key: string) {
    try {
      window.localStorage.removeItem(key)
    } catch {
      /* ignore */
    }
  },
}
