import { ApiError } from '../api/client'
import { messages } from './messages'
import { createTranslator, describeDue, errorMessage } from './translate'

const today = new Date(2026, 10, 11) // Nov 11, 2026

describe('describeDue', () => {
  it.each([
    ['2026-11-08', '3 days overdue', 'Vencida hace 3 días', 'overdue'],
    ['2026-11-10', '1 day overdue', 'Vencida hace 1 día', 'overdue'],
    ['2026-11-11', 'Due today', 'Vence hoy', 'soon'],
    ['2026-11-12', 'Due tomorrow', 'Vence mañana', 'soon'],
    ['2026-11-16', 'Due in 5 days', 'Vence en 5 días', 'later'],
  ])('%s', (date, en, es, tone) => {
    expect(describeDue(date, 'en', today)).toEqual({ text: en, tone })
    expect(describeDue(date, 'es', today)).toEqual({ text: es, tone })
  })

  it('formats distant dates in each locale', () => {
    expect(describeDue('2026-12-01', 'en', today).text).toBe('Due Dec 1')
    expect(describeDue('2026-12-01', 'es', today).text).toMatch(/^Vence el 1 de? dic/)
    expect(describeDue('2027-01-15', 'en', today).text).toBe('Due Jan 15, 2027')
  })
})

describe('createTranslator', () => {
  it('fills in placeholders', () => {
    expect(createTranslator('es')('toast.moved', { column: 'Hecho' })).toBe('Movida a Hecho')
  })

  it('has a Spanish translation for every English message', () => {
    const missing = Object.keys(messages.en).filter((key) => !messages.es[key as keyof typeof messages.es])
    expect(missing).toEqual([])
  })
})

describe('errorMessage', () => {
  const t = createTranslator('es')

  it.each([
    [new ApiError(0, 'offline'), 'No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.'],
    [new ApiError(401, 'Invalid email or password'), 'Correo o contraseña incorrectos.'],
    [new ApiError(401, 'Invalid or expired token'), 'Tu sesión expiró. Inicia sesión de nuevo.'],
    [new ApiError(409, 'Email is already registered'), 'Este correo ya está registrado. Inicia sesión.'],
    [new Error('boom'), 'Algo salió mal. Inténtalo de nuevo.'],
  ])('translates %s', (error, expected) => {
    expect(errorMessage(error, t)).toBe(expected)
  })
})
