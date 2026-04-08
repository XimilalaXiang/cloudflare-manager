import { useEffect, useState } from 'react'
import api from '../lib/api'

interface Account { id: number; name: string }

type Tab = 'kv' | 'd1' | 'r2'

export default function Storage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [selectedAccount, setSelectedAccount] = useState<number | null>(null)
  const [tab, setTab] = useState<Tab>('kv')
  const [data, setData] = useState<unknown[]>([])
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
    const endpoints: Record<Tab, string> = {
      kv: `/cf/${selectedAccount}/kv/namespaces`,
      d1: `/cf/${selectedAccount}/d1/databases`,
      r2: `/cf/${selectedAccount}/r2/buckets`,
    }
    api.get(endpoints[tab])
      .then((res) => setData(res.data || []))
      .catch(() => setData([]))
      .finally(() => setLoading(false))
  }, [selectedAccount, tab])

  const tabs: { key: Tab; label: string; color: string }[] = [
    { key: 'kv', label: 'KV STORAGE', color: '#ff006e' },
    { key: 'd1', label: 'D1 DATABASE', color: '#3a86ff' },
    { key: 'r2', label: 'R2 BUCKET', color: '#06d6a0' },
  ]

  return (
    <div className="py-8 md:py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="font-black text-3xl md:text-5xl tracking-tight mb-2">
          STOR<span className="text-[#3a86ff]">AGE</span>
        </h1>
        <p className="font-mono text-sm md:text-base mb-8">KV, D1, and R2 management</p>

        {accounts.length > 0 && (
          <div className="mb-6">
            <label className="font-black uppercase tracking-widest text-xs mb-2 block">SELECT ACCOUNT</label>
            <select
              value={selectedAccount || ''}
              onChange={(e) => setSelectedAccount(Number(e.target.value))}
              className="border-2 md:border-4 border-black bg-white font-medium focus:outline-none focus:bg-[#ffbe0b] transition-colors duration-200 px-3 py-2 md:px-4 md:py-3 text-sm"
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
        )}

        <div className="flex gap-2 mb-8">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`font-bold uppercase tracking-widest transition-all duration-200 px-4 py-2 border-2 md:border-4 border-black text-xs md:text-sm ${
                tab === t.key
                  ? `bg-black text-white shadow-[4px_4px_0px_0px_${t.color}] md:shadow-[8px_8px_0px_0px_${t.color}]`
                  : 'bg-white text-black hover:bg-black hover:text-white'
              }`}
              style={tab === t.key ? { boxShadow: `4px 4px 0px 0px ${t.color}` } : {}}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="border-2 md:border-4 border-black p-8 text-center font-mono">Loading...</div>
        ) : (data as unknown[]).length === 0 ? (
          <div className="border-2 md:border-4 border-black p-8 md:p-12 text-center">
            <p className="font-black text-xl md:text-2xl mb-2">
              NO {tab === 'kv' ? 'NAMESPACES' : tab === 'd1' ? 'DATABASES' : 'BUCKETS'}
            </p>
            <p className="font-mono text-sm">
              {accounts.length === 0 ? 'Add an account first.' : `No ${tab.toUpperCase()} resources found.`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {(data as Record<string, unknown>[]).map((item, i) => (
              <div
                key={i}
                className="bg-white border-2 md:border-4 border-black p-4 md:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all"
              >
                <h3 className="font-black text-lg mb-2">
                  {(item.title || item.name || item.uuid || `Item ${i + 1}`) as string}
                </h3>
                <div className="font-mono text-xs space-y-1">
                  {tab === 'kv' && <p>ID: {item.id as string}</p>}
                  {tab === 'd1' && (
                    <>
                      <p>UUID: {(item.uuid as string)?.slice(0, 16)}...</p>
                      <p>Tables: {item.num_tables as number}</p>
                      <p>Size: {((item.file_size as number) / 1024).toFixed(1)}KB</p>
                    </>
                  )}
                  {tab === 'r2' && (
                    <p>Location: {(item.location as string) || 'Default'}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
