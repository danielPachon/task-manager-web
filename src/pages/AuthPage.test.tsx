import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { AuthProvider } from '../auth/AuthContext'
import { AuthPage } from './AuthPage'

function renderAuth() {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <AuthProvider>
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/login" element={<AuthPage />} />
            <Route path="/" element={<p>Board page</p>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>,
  )
}

const jsonResponse = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

describe('AuthPage', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('logs in and redirects to the board', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse(200, {
        token: 'jwt',
        user: { id: '1', name: 'Daniel', email: 'daniel@example.com', createdAt: '' },
      }),
    )
    vi.stubGlobal('fetch', fetchMock)
    renderAuth()

    await userEvent.type(screen.getByLabelText('Email'), 'daniel@example.com')
    await userEvent.type(screen.getByLabelText('Password'), 'Secret123')
    await userEvent.click(screen.getByRole('button', { name: 'Log in' }))

    expect(await screen.findByText('Board page')).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/auth/login'),
      expect.objectContaining({ method: 'POST' }),
    )
    expect(localStorage.getItem('tm.token')).toBe('jwt')
  })

  it('shows field errors returned by the API', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse(400, {
          error: { message: 'Validation failed', details: { password: ['Password must contain a number'] } },
        }),
      ),
    )
    renderAuth()

    await userEvent.click(screen.getByRole('tab', { name: 'Create account' }))
    await userEvent.type(screen.getByLabelText('Name'), 'Daniel')
    await userEvent.type(screen.getByLabelText('Email'), 'daniel@example.com')
    await userEvent.type(screen.getByLabelText('Password'), 'password')
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }))

    expect(await screen.findByText('Password must contain a number')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('Check the highlighted fields.')
  })

  it('shows the API message for wrong credentials', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse(401, { error: { message: 'Invalid email or password' } })),
    )
    renderAuth()

    await userEvent.type(screen.getByLabelText('Email'), 'daniel@example.com')
    await userEvent.type(screen.getByLabelText('Password'), 'Wrong1234')
    await userEvent.click(screen.getByRole('button', { name: 'Log in' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid email or password')
  })
})
