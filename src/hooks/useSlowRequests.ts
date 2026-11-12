import { useEffect, useState } from 'react'
import { onSlowRequests } from '../api/client'

export function useSlowRequests() {
  const [slow, setSlow] = useState(false)
  useEffect(() => onSlowRequests(setSlow), [])
  return slow
}
