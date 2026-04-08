import { Link, useLocation } from 'react-router-dom'

interface NavbarProps {
  username?: string
  onLogout: () => void
}

export default function Navbar({ username, onLogout }: NavbarProps) {
  const location = useLocation()

  const navLinks = [
    { to: '/', label: 'DASHBOARD' },
    { to: '/accounts', label: 'ACCOUNTS' },
    { to: '/workers', label: 'WORKERS' },
    { to: '/zones', label: 'ZONES' },
    { to: '/storage', label: 'STORAGE' },
  ]

  return (
    <nav className="bg-white border-b-2 md:border-b-4 border-black px-4 md:px-8 py-3 md:py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <Link to="/" className="font-black text-xl md:text-2xl tracking-wider">
          CF<span className="text-[#ff006e]">/</span>MANAGER
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

        <div className="flex items-center gap-4">
          <span className="font-mono text-sm hidden md:inline">{username}</span>
          <button
            onClick={onLogout}
            className="font-bold uppercase tracking-widest transition-colors duration-200 bg-black text-white px-3 py-1.5 md:px-4 md:py-2 border-2 border-black text-xs md:text-sm hover:bg-[#ff006e] hover:border-[#ff006e]"
          >
            LOGOUT
          </button>
        </div>
      </div>
    </nav>
  )
}
