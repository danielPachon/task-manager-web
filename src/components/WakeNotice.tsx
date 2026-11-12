import { useSlowRequests } from '../hooks/useSlowRequests'
import { usePreferences } from '../preferences/PreferencesContext'

/** The API runs on a free tier that sleeps when idle; explain the delay instead of looking frozen. */
export function WakeNotice() {
  const slow = useSlowRequests()
  const { t } = usePreferences()
  if (!slow) return null
  return (
    <div className="wake-notice" role="status">
      <span className="spinner" aria-hidden="true" />
      {t('wake.notice')}
    </div>
  )
}
