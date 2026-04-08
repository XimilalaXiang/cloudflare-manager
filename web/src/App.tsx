import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { useI18n } from './i18n'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Accounts from './pages/Accounts'
import Workers from './pages/Workers'
import Zones from './pages/Zones'
import Storage from './pages/Storage'

export default function App() {
  const { user, loading, login, logout } = useAuth()
  const { t } = useI18n()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="border-2 md:border-4 border-black p-8 md:p-12">
          <h1 className="font-black text-2xl md:text-4xl tracking-tight">
            CF<span className="text-[#ff006e]">/</span>MANAGER
          </h1>
          <p className="font-mono text-sm mt-2">{t.common.loading}</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login onLogin={login} />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    )
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar username={user.username} onLogout={() => { logout(); window.location.href = '/login' }} />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/accounts" element={<Accounts />} />
            <Route path="/workers" element={<Workers />} />
            <Route path="/zones" element={<Zones />} />
            <Route path="/storage" element={<Storage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <footer className="bg-black text-white py-8 md:py-12 px-4 md:px-8 border-t-2 md:border-t-4 border-black">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="font-black text-xl">CF<span className="text-[#ff006e]">/</span>MANAGER</span>
              <p className="font-mono text-xs mt-1 text-white">{t.footer.subtitle}</p>
            </div>
            <p className="font-mono text-xs text-white">
              {t.footer.tech}
            </p>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  )
}
