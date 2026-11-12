import { render, type RenderOptions } from '@testing-library/react'
import type { ReactElement } from 'react'
import { PreferencesProvider } from '../preferences/PreferencesContext'

/** Renders inside the preferences provider (language and theme), as the app does. */
export function renderWithPrefs(ui: ReactElement, options?: RenderOptions) {
  return render(<PreferencesProvider>{ui}</PreferencesProvider>, options)
}
