import { useEffect, useState } from 'react'
import api from '../lib/api'
import { useI18n } from '../i18n'

interface Account { id: number; name: string }
interface Worker { id: string; size: number; created_on: string; modified_on: string }

export default function Workers() {
  const { t } = useI18n()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [selectedAccount, setSelectedAccount] = useState<number | null>(null)
  const [workers, setWorkers] = useState<Worker[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get('/accounts').then((res) => {
      const accts = res.data || []
      setAccounts(accts)
      if (accts.length > 0) setSelectedAccount(accts[0].id)
    })
  }, [])

  useEffect(() => {
    if (!selectedAccount) return
    setLoading(true)
    api.get(`/cf/${selectedAccount}/workers`)
      .then((res) => setWorkers(res.data || []))
      .catch(() => setWorkers([]))
      .finally(() => setLoading(false))
  }, [selectedAccount])

  return (
    <div className="py-8 md:py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="font-black text-3xl md:text-5xl tracking-tight mb-2">
          {t.workers.title}<span className="text-[#ffbe0b]">{t.workers.titleHighlight}</span>
        </h1>
        <p className="font-mono text-sm md:text-base mb-8">{t.workers.subtitle}</p>

        {accounts.length > 0 && (
          <div className="mb-8">
            <label className="font-black uppercase tracking-widest text-xs mb-2 block">{t.workers.selectAccount}</label>
            <select
              value={selectedAccount || ''}
              onChange={(e) => setSelectedAccount(Number(e.target.value))}
              className="border-2 md:border-4 border-black bg-white font-medium focus:outline-none focus:bg-[#ffbe0b] transition-colors duration-200 px-3 py-2 md:px-4 md:py-3 text-sm min-w-48"
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
        )}

        {loading ? (
          <div className="border-2 md:border-4 border-black p-8 text-center font-mono">{t.workers.loadingWorkers}</div>
        ) : workers.length === 0 ? (
          <div className="border-2 md:border-4 border-black p-8 md:p-12 text-center">
            <p className="font-black text-xl md:text-2xl mb-2">{t.workers.noWorkers}</p>
            <p className="font-mono text-sm">
              {accounts.length === 0 ? t.workers.noWorkersDescNoAccount : t.workers.noWorkersDesc}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {workers.map((w) => (
              <div
                key={w.id}
                className="bg-white border-2 md:border-4 border-black p-4 md:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(255,190,11,1)] md:hover:shadow-[8px_8px_0px_0px_rgba(255,190,11,1)] hover:-translate-y-1 transition-all"
              >
                <h3 className="font-black text-lg md:text-xl mb-2 truncate">{w.id}</h3>
                <div className="font-mono text-xs space-y-1">
                  <p>{t.workers.size}: <span className="font-bold">{(w.size / 1024).toFixed(1)}KB</span></p>
                  <p>{t.workers.created}: {w.created_on?.slice(0, 10)}</p>
                  <p>{t.workers.modified}: {w.modified_on?.slice(0, 10)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
