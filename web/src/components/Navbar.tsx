import { Link, useLocation } from 'react-router-dom'
import { useI18n } from '../i18n'

interface NavbarProps {
  username?: string
  onLogout: () => void
}

export default function Navbar({ username, onLogout }: NavbarProps) {
  const location = useLocation()
  const { t, locale, toggle } = useI18n()

  const navLinks = [
    { to: '/', label: t.nav.dashboard },
    { to: '/accounts', label: t.nav.accounts },
    { to: '/workers', label: t.nav.workers },
    { to: '/zones', label: t.nav.zones },
    { to: '/storage', label: t.nav.storage },
  ]

  return (
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
          <span className="font-mono text-sm hidden md:inline">{username}</span>
          <button
            onClick={onLogout}
            className="font-bold uppercase tracking-widest transition-colors duration-200 bg-black text-white px-3 py-1.5 md:px-4 md:py-2 border-2 border-black text-xs md:text-sm hover:bg-[#ff006e] hover:border-[#ff006e]"
          >
            {t.nav.logout}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
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
  )
}
