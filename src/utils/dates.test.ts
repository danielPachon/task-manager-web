import { describeDue } from './dates'

const today = new Date(2026, 10, 11) // Nov 11, 2026

describe('describeDue', () => {
  it.each([
    ['2026-11-08', '3 days overdue', 'overdue'],
    ['2026-11-10', '1 day overdue', 'overdue'],
    ['2026-11-11', 'Due today', 'soon'],
    ['2026-11-12', 'Due tomorrow', 'soon'],
    ['2026-11-16', 'Due in 5 days', 'later'],
    ['2026-12-01', 'Due Dec 1', 'later'],
    ['2027-01-15', 'Due Jan 15, 2027', 'later'],
  ])('%s → %s', (date, text, tone) => {
    expect(describeDue(date, today)).toEqual({ text, tone })
  })
})
