import { useState, type FormEvent } from 'react'
import { Link, useLocation } from 'react-router-dom'
import api from '../lib/api'
import { useI18n } from '../i18n'

interface NavbarProps {
  username?: string
  onLogout: () => void
}

export default function Navbar({ username, onLogout }: NavbarProps) {
  const location = useLocation()
  const { t, locale, toggle } = useI18n()
  const [showPwModal, setShowPwModal] = useState(false)
  const [pwForm, setPwForm] = useState({ old_password: '', new_password: '', confirm: '' })
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState('')
  const [pwSubmitting, setPwSubmitting] = useState(false)

  const navLinks = [
    { to: '/', label: t.nav.dashboard },
    { to: '/accounts', label: t.nav.accounts },
    { to: '/workers', label: t.nav.workers },
    { to: '/zones', label: t.nav.zones },
    { to: '/storage', label: t.nav.storage },
    { to: '/routes', label: t.nav.routes },
    { to: '/pages', label: t.nav.pages },
    { to: '/email', label: t.nav.email },
  ]

  const handleChangePw = async (e: FormEvent) => {
    e.preventDefault()
    setPwError('')
    setPwSuccess('')
    if (pwForm.new_password.length < 6) { setPwError(t.changePassword.minLength); return }
    if (pwForm.new_password !== pwForm.confirm) { setPwError(t.changePassword.mismatch); return }
    setPwSubmitting(true)
    try {
      await api.post('/auth/change-password', { old_password: pwForm.old_password, new_password: pwForm.new_password })
      setPwSuccess(t.changePassword.success)
      setPwForm({ old_password: '', new_password: '', confirm: '' })
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || t.common.failed
      setPwError(msg)
    } finally {
      setPwSubmitting(false)
    }
  }

  const closePwModal = () => {
    setShowPwModal(false)
    setPwForm({ old_password: '', new_password: '', confirm: '' })
    setPwError('')
    setPwSuccess('')
  }

  return (
    <>
      <nav className="bg-white border-b-2 md:border-b-4 border-black px-4 md:px-8 py-3 md:py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Link to="/" className="font-black text-xl md:text-2xl tracking-wider">
            {t.nav.brand}<span className="text-[#ff006e]">{t.nav.brandSeparator}</span>{t.nav.brandSuffix}
          </Link>

          <div className="hidden md:flex gap-6 font-mono text-sm">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`font-bold uppercase tracking-widest transition-colors duration-200 border-b-2 pb-0.5 ${
                  location.pathname === link.to
                    ? 'border-[#ff006e] text-black'
                    : 'border-transparent text-black hover:border-black'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={toggle}
              className="font-bold tracking-widest transition-all duration-200 bg-white text-black px-2.5 py-1.5 md:px-3 md:py-2 border-2 border-black text-xs hover:bg-[#ffbe0b] active:scale-95"
              title={locale === 'en' ? '切换到中文' : 'Switch to English'}
            >
              {locale === 'en' ? '中文' : 'EN'}
            </button>
            <button
              onClick={() => setShowPwModal(true)}
              className="font-bold uppercase tracking-widest transition-all duration-200 bg-white text-black px-2.5 py-1.5 md:px-3 md:py-2 border-2 border-black text-xs hover:bg-[#3a86ff] hover:text-white active:scale-95"
            >
              {t.nav.changePassword}
            </button>
            <span className="font-mono text-sm hidden md:inline">{username}</span>
            <button
              onClick={onLogout}
              className="font-bold uppercase tracking-widest transition-colors duration-200 bg-black text-white px-3 py-1.5 md:px-4 md:py-2 border-2 border-black text-xs md:text-sm hover:bg-[#ff006e] hover:border-[#ff006e]"
            >
              {t.nav.logout}
            </button>
          </div>
        </div>

        <div className="flex md:hidden gap-3 mt-3 overflow-x-auto pb-1 font-mono text-xs">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`font-bold uppercase tracking-widest whitespace-nowrap transition-colors duration-200 border-b-2 pb-0.5 ${
                location.pathname === link.to
                  ? 'border-[#ff006e] text-black'
                  : 'border-transparent text-black'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>

      {showPwModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={closePwModal}>
          <div className="bg-white border-2 md:border-4 border-black p-6 md:p-8 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-black text-xl md:text-2xl mb-6">{t.changePassword.title}</h2>
            {pwError && (
              <div className="border-2 border-[#ff006e] bg-[#ff006e] text-white font-bold p-3 mb-4 text-sm font-mono">{pwError}</div>
            )}
            {pwSuccess && (
              <div className="border-2 border-[#06d6a0] bg-[#06d6a0] text-black font-bold p-3 mb-4 text-sm font-mono">{pwSuccess}</div>
            )}
            <form onSubmit={handleChangePw} className="space-y-4">
              <div>
                <label className="font-black uppercase tracking-widest text-xs mb-1 block">{t.changePassword.oldPassword}</label>
                <input
                  type="password"
                  value={pwForm.old_password}
                  onChange={(e) => setPwForm({ ...pwForm, old_password: e.target.value })}
                  className="w-full border-2 md:border-4 border-black bg-white font-medium focus:outline-none focus:bg-[#ffbe0b] transition-colors duration-200 px-3 py-2 md:px-4 md:py-3 text-sm"
                  required
                />
              </div>
              <div>
                <label className="font-black uppercase tracking-widest text-xs mb-1 block">{t.changePassword.newPassword}</label>
                <input
                  type="password"
                  value={pwForm.new_password}
                  onChange={(e) => setPwForm({ ...pwForm, new_password: e.target.value })}
                  className="w-full border-2 md:border-4 border-black bg-white font-medium focus:outline-none focus:bg-[#ffbe0b] transition-colors duration-200 px-3 py-2 md:px-4 md:py-3 text-sm"
                  required
                />
              </div>
              <div>
                <label className="font-black uppercase tracking-widest text-xs mb-1 block">{t.changePassword.confirmPassword}</label>
                <input
                  type="password"
                  value={pwForm.confirm}
                  onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
                  className="w-full border-2 md:border-4 border-black bg-white font-medium focus:outline-none focus:bg-[#ffbe0b] transition-colors duration-200 px-3 py-2 md:px-4 md:py-3 text-sm"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={pwSubmitting}
                  className="font-bold uppercase tracking-widest transition-all duration-200 bg-[#3a86ff] text-white px-6 py-3 border-2 md:border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] text-sm disabled:opacity-80"
                >
                  {pwSubmitting ? t.changePassword.submitting : t.changePassword.submit}
                </button>
                <button
                  type="button"
                  onClick={closePwModal}
                  className="font-bold uppercase tracking-widest transition-all duration-200 bg-white text-black px-6 py-3 border-2 md:border-4 border-black text-sm hover:bg-black hover:text-white"
                >
                  {t.common.close}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
