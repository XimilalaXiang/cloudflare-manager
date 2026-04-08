import { useEffect, useState } from 'react'
import api from '../lib/api'
import { useI18n } from '../i18n'

interface Account { id: number; name: string }

type Tab = 'kv' | 'd1' | 'r2'

export default function Storage() {
  const { t } = useI18n()
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
    { key: 'kv', label: t.storage.tabKv, color: '#ff006e' },
    { key: 'd1', label: t.storage.tabD1, color: '#3a86ff' },
    { key: 'r2', label: t.storage.tabR2, color: '#06d6a0' },
  ]

  const emptyLabel: Record<Tab, string> = {
    kv: t.storage.noKv,
    d1: t.storage.noD1,
    r2: t.storage.noR2,
  }

  return (
    <div className="py-8 md:py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="font-black text-3xl md:text-5xl tracking-tight mb-2">
          {t.storage.title}<span className="text-[#3a86ff]">{t.storage.titleHighlight}</span>
        </h1>
        <p className="font-mono text-sm md:text-base mb-8">{t.storage.subtitle}</p>

        {accounts.length > 0 && (
          <div className="mb-6">
            <label className="font-black uppercase tracking-widest text-xs mb-2 block">{t.storage.selectAccount}</label>
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

        <div className="flex gap-2 mb-8 flex-wrap">
          {tabs.map((item) => (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              className={`font-bold uppercase tracking-widest transition-all duration-200 px-4 py-2 border-2 md:border-4 border-black text-xs md:text-sm ${
                tab === item.key
                  ? 'bg-black text-white'
                  : 'bg-white text-black hover:bg-black hover:text-white'
              }`}
              style={tab === item.key ? { boxShadow: `4px 4px 0px 0px ${item.color}` } : {}}
            >
              {item.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="border-2 md:border-4 border-black p-8 text-center font-mono">{t.common.loading}</div>
        ) : (data as unknown[]).length === 0 ? (
          <div className="border-2 md:border-4 border-black p-8 md:p-12 text-center">
            <p className="font-black text-xl md:text-2xl mb-2">
              {emptyLabel[tab]}
            </p>
            <p className="font-mono text-sm">
              {accounts.length === 0 ? t.storage.noStorageDescNoAccount : t.storage.noStorageDesc(tab)}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {(data as Record<string, unknown>[]).map((item, i) => (
              <div
                key={i}
                className="bg-white border-2 md:border-4 border-black p-4 md:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all"
              >
                <h3 className="font-black text-lg mb-2 truncate">
                  {(item.title || item.name || item.uuid || `Item ${i + 1}`) as string}
                </h3>
                <div className="font-mono text-xs space-y-1">
                  {tab === 'kv' && <p>{t.storage.kvId}: {item.id as string}</p>}
                  {tab === 'd1' && (
                    <>
                      <p>{t.storage.d1Uuid}: {(item.uuid as string)?.slice(0, 16)}...</p>
                      <p>{t.storage.d1Tables}: {item.num_tables as number}</p>
                      <p>{t.storage.d1Size}: {((item.file_size as number) / 1024).toFixed(1)}KB</p>
                    </>
                  )}
                  {tab === 'r2' && (
                    <p>{t.storage.r2Location}: {(item.location as string) || t.storage.r2LocationDefault}</p>
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
