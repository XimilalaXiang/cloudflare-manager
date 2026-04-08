import { useState, type FormEvent } from 'react'
import { useI18n } from '../i18n'

interface LoginProps {
  onLogin: (username: string, password: string) => Promise<void>
}

export default function Login({ onLogin }: LoginProps) {
  const { t, locale, toggle } = useI18n()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await onLogin(username, password)
    } catch {
      setError(t.login.invalidCredentials)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[5%] w-32 h-32 md:w-64 md:h-64 bg-[#ff006e] rotate-12" />
        <div className="absolute bottom-[15%] right-[10%] w-24 h-24 md:w-48 md:h-48 bg-[#3a86ff] -rotate-6" />
        <div className="absolute top-[60%] left-[60%] w-16 h-16 md:w-32 md:h-32 bg-[#ffbe0b] rounded-full" />
        <div className="absolute top-[5%] right-[20%] w-20 h-20 md:w-40 md:h-40 border-4 border-black rotate-45" />
      </div>

      <button
        onClick={toggle}
        className="absolute top-4 right-4 z-20 font-bold tracking-widest transition-all duration-200 bg-white text-black px-3 py-1.5 border-2 border-black text-xs hover:bg-[#ffbe0b] active:scale-95"
        title={locale === 'en' ? '切换到中文' : 'Switch to English'}
      >
        {locale === 'en' ? '中文' : 'EN'}
      </button>

      <div className="relative z-10 w-full max-w-md">
        <div className="border-2 md:border-4 border-black bg-white p-6 md:p-10">
          <h1 className="font-black text-3xl md:text-5xl tracking-tight mb-2">
            CF<span className="text-[#ff006e]">/</span>MANAGER
          </h1>
          <p className="font-mono text-sm md:text-base mb-8 text-black">
            {t.login.subtitle}
          </p>

          {error && (
            <div className="border-2 md:border-4 border-[#ff006e] bg-[#ff006e] text-white font-bold p-3 mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            <div>
              <label className="font-black uppercase tracking-widest text-xs mb-2 block">
                {t.login.username}
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border-2 md:border-4 border-black bg-white font-medium focus:outline-none focus:bg-[#ffbe0b] transition-colors duration-200 px-3 py-2 md:px-4 md:py-3 text-sm md:text-base"
                placeholder={t.login.usernamePlaceholder}
                required
              />
            </div>
            <div>
              <label className="font-black uppercase tracking-widest text-xs mb-2 block">
                {t.login.password}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-2 md:border-4 border-black bg-white font-medium focus:outline-none focus:bg-[#ffbe0b] transition-colors duration-200 px-3 py-2 md:px-4 md:py-3 text-sm md:text-base"
                placeholder={t.login.passwordPlaceholder}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full font-bold uppercase tracking-widest transition-all duration-200 bg-black text-white px-4 py-3 md:px-6 md:py-4 border-2 md:border-4 border-black shadow-[4px_4px_0px_0px_rgba(255,0,110,1)] md:shadow-[8px_8px_0px_0px_rgba(255,0,110,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] active:scale-95 text-sm md:text-base disabled:opacity-80"
            >
              {loading ? t.login.signingIn : t.login.signIn}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
