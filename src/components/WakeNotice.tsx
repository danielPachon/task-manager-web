import { useSlowRequests } from '../hooks/useSlowRequests'

/** The API runs on a free tier that sleeps when idle; explain the delay instead of looking frozen. */
export function WakeNotice() {
  const slow = useSlowRequests()
  if (!slow) return null
  return (
    <div className="wake-notice" role="status">
      <span className="spinner" aria-hidden="true" />
      The server is waking up after being idle. This can take up to a minute.
    </div>
  )
}
