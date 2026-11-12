export function Wordmark() {
  return (
    <span className="wordmark">
      <svg className="wordmark__mark" viewBox="0 0 24 24" aria-hidden="true">
        <rect x="2" y="3" width="6" height="18" rx="1.5" className="mark-todo" />
        <rect x="9" y="3" width="6" height="12" rx="1.5" className="mark-progress" />
        <rect x="16" y="3" width="6" height="7" rx="1.5" className="mark-done" />
      </svg>
      Task Manager
    </span>
  )
}
