import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import { useI18n } from '../i18n'

interface Account {
  id: number
  name: string
  email: string
  account_id: string
  api_token_masked: string
  status: string
}

export default function Dashboard() {
  const { t } = useI18n()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/accounts').then((res) => setAccounts(res.data || [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const stats = [
    { label: t.dashboard.statAccounts, value: accounts.length, color: 'bg-[#ff006e]' },
    { label: t.dashboard.statActive, value: accounts.filter((a) => a.status === 'active').length, color: 'bg-[#3a86ff]' },
    { label: t.dashboard.statInactive, value: accounts.filter((a) => a.status !== 'active').length, color: 'bg-[#ffbe0b]' },
  ]

  return (
    <div className="py-8 md:py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 md:mb-12">
          <div>
            <h1 className="font-black text-3xl md:text-5xl tracking-tight">
              {t.dashboard.title}<span className="text-[#ff006e]">{t.dashboard.titleHighlight}</span>
            </h1>
            <p className="font-mono text-sm md:text-base mt-2">
              {t.dashboard.subtitle}
            </p>
          </div>
          <Link
            to="/accounts"
            className="self-start sm:self-auto font-bold uppercase tracking-widest transition-all duration-200 bg-black text-white px-4 py-2 md:px-6 md:py-3 border-2 md:border-4 border-black shadow-[4px_4px_0px_0px_rgba(255,0,110,1)] md:shadow-[8px_8px_0px_0px_rgba(255,0,110,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] text-xs md:text-sm"
          >
            {t.dashboard.manageAccounts}
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={`${stat.color} border-2 md:border-4 border-black p-4 md:p-8`}
            >
              <span className="font-mono text-xs md:text-sm text-white font-bold uppercase tracking-widest">
                {stat.label}
              </span>
              <div className="font-black text-4xl md:text-6xl text-white mt-2">
                {loading ? '—' : stat.value}
              </div>
            </div>
          ))}
        </div>

        <h2 className="font-black text-xl md:text-3xl mb-4 md:mb-6">{t.dashboard.accountsTitle}</h2>

        {loading ? (
          <div className="border-2 md:border-4 border-black p-8 text-center font-mono">
            {t.common.loading}
          </div>
        ) : accounts.length === 0 ? (
          <div className="border-2 md:border-4 border-black p-8 md:p-12 text-center">
            <p className="font-black text-xl md:text-2xl mb-4">{t.dashboard.noAccountsTitle}</p>
            <p className="font-mono text-sm mb-6">{t.dashboard.noAccountsDesc}</p>
            <Link
              to="/accounts"
              className="font-bold uppercase tracking-widest transition-all duration-200 bg-[#ff006e] text-white px-4 py-2 md:px-6 md:py-3 border-2 md:border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] text-xs md:text-sm"
            >
              {t.dashboard.addAccount}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="bg-white border-2 md:border-4 border-black p-4 md:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(255,0,110,1)] md:hover:shadow-[8px_8px_0px_0px_rgba(255,0,110,1)] hover:-translate-y-1 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-black text-lg md:text-xl">{account.name}</h3>
                  <span
                    className={`font-mono text-xs font-bold px-2 py-1 border-2 border-black ${
                      account.status === 'active'
                        ? 'bg-[#06d6a0] text-black'
                        : 'bg-[#ff006e] text-white'
                    }`}
                  >
                    {account.status.toUpperCase()}
                  </span>
                </div>
                <p className="font-mono text-sm text-black mb-1">{account.email}</p>
                <p className="font-mono text-xs text-black">
                  {t.dashboard.token}: {account.api_token_masked}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
