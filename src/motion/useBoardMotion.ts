import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { Flip } from 'gsap/Flip'
import { useCallback, useRef, type RefObject } from 'react'
import { storage } from '../utils/storage'

gsap.registerPlugin(useGSAP, Flip)

const MOVE_DURATION = 0.28
const ENTER_DURATION = 0.3
const ENTER_STAGGER = 0.025
const INTRO_KEY = 'tm.board-intro'

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Motion for the board, kept deliberately small (this is product UI people use all day):
 * - a card that changes column travels to its new place (GSAP Flip), so the change is easy to follow;
 * - cards fade in once per browser session on the first load, never on refetches.
 * Returns `captureLayout`, to call right before a change that moves cards.
 */
export function useBoardMotion(scope: RefObject<HTMLElement | null>, ready: boolean, layoutKey: unknown) {
  const pending = useRef<Flip.FlipState | null>(null)

  const captureLayout = useCallback(() => {
    if (!scope.current || prefersReducedMotion()) return
    pending.current = Flip.getState(scope.current.querySelectorAll('[data-flip-id]'))
  }, [scope])

  // Runs after the DOM reflects the new task positions
  useGSAP(
    () => {
      const state = pending.current
      if (!state || !scope.current) return
      pending.current = null
      Flip.from(state, {
        targets: scope.current.querySelectorAll('[data-flip-id]'),
        duration: MOVE_DURATION,
        ease: 'power2.inOut',
        nested: true,
      })
    },
    { scope, dependencies: [layoutKey] },
  )

  useGSAP(
    () => {
      if (!ready || prefersReducedMotion() || storage.getSession(INTRO_KEY)) return
      storage.setSession(INTRO_KEY, '1')
      gsap.from('.card', {
        y: 8,
        opacity: 0,
        duration: ENTER_DURATION,
        stagger: ENTER_STAGGER,
        ease: 'power2.out',
        clearProps: 'transform,opacity',
      })
    },
    { scope, dependencies: [ready] },
  )

  return captureLayout
}
