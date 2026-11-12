import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { useAuth } from './auth/AuthContext'
import { WakeNotice } from './components/WakeNotice'
import { AuthPage } from './pages/AuthPage'
import { BoardPage } from './pages/BoardPage'

function Protected({ children }: { children: React.ReactElement }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route
          path="/"
          element={
            <Protected>
              <BoardPage />
            </Protected>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <WakeNotice />
    </BrowserRouter>
  )
}
