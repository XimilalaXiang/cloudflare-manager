import { useEffect, useState, type FormEvent } from 'react'
import api from '../lib/api'
import { useI18n } from '../i18n'

interface Account { id: number; name: string }
type Tab = 'kv' | 'd1' | 'r2'

interface KVNamespace { id: string; title: string }
interface KVKey { name: string }
interface D1Database { uuid: string; name: string; num_tables: number; file_size: number }
interface R2Bucket { name: string; location: string }

export default function Storage() {
  const { t } = useI18n()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [selectedAccount, setSelectedAccount] = useState<number | null>(null)
  const [tab, setTab] = useState<Tab>('kv')

  // KV state
  const [kvNamespaces, setKvNamespaces] = useState<KVNamespace[]>([])
  const [kvLoading, setKvLoading] = useState(false)
  const [showCreateNs, setShowCreateNs] = useState(false)
  const [nsTitle, setNsTitle] = useState('')
  const [nsCreating, setNsCreating] = useState(false)
  const [selectedNs, setSelectedNs] = useState<string | null>(null)
  const [kvKeys, setKvKeys] = useState<KVKey[]>([])
  const [kvKeysLoading, setKvKeysLoading] = useState(false)
  const [showAddKey, setShowAddKey] = useState(false)
  const [newKeyForm, setNewKeyForm] = useState({ key: '', value: '' })
  const [keyCreating, setKeyCreating] = useState(false)
  const [viewingKey, setViewingKey] = useState<{ key: string; value: string } | null>(null)
  const [kvValueLoading, setKvValueLoading] = useState(false)

  // D1 state
  const [d1Databases, setD1Databases] = useState<D1Database[]>([])
  const [d1Loading, setD1Loading] = useState(false)
  const [showCreateDb, setShowCreateDb] = useState(false)
  const [dbName, setDbName] = useState('')
  const [dbCreating, setDbCreating] = useState(false)
  const [queryDbId, setQueryDbId] = useState<string | null>(null)
  const [sqlQuery, setSqlQuery] = useState('')
  const [queryResult, setQueryResult] = useState<unknown>(null)
  const [querying, setQuerying] = useState(false)

  // R2 state
  const [r2Buckets, setR2Buckets] = useState<R2Bucket[]>([])
  const [r2Loading, setR2Loading] = useState(false)
  const [showCreateBucket, setShowCreateBucket] = useState(false)
  const [bucketForm, setBucketForm] = useState({ name: '', location: '' })
  const [bucketCreating, setBucketCreating] = useState(false)

  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/accounts').then((res) => {
      const accts = res.data || []
      setAccounts(accts)
      if (accts.length > 0) setSelectedAccount(accts[0].id)
    })
  }, [])

  // Load data based on tab
  const loadKv = () => {
    if (!selectedAccount) return
    setKvLoading(true)
    api.get(`/cf/${selectedAccount}/kv/namespaces`)
      .then((res) => setKvNamespaces(res.data || []))
      .catch(() => setKvNamespaces([]))
      .finally(() => setKvLoading(false))
  }

  const loadD1 = () => {
    if (!selectedAccount) return
    setD1Loading(true)
    api.get(`/cf/${selectedAccount}/d1/databases`)
      .then((res) => setD1Databases(res.data || []))
      .catch(() => setD1Databases([]))
      .finally(() => setD1Loading(false))
  }

  const loadR2 = () => {
    if (!selectedAccount) return
    setR2Loading(true)
    api.get(`/cf/${selectedAccount}/r2/buckets`)
      .then((res) => setR2Buckets(res.data || []))
      .catch(() => setR2Buckets([]))
      .finally(() => setR2Loading(false))
  }

  useEffect(() => {
    if (!selectedAccount) return
    setSelectedNs(null); setKvKeys([]); setViewingKey(null)
    setQueryDbId(null); setQueryResult(null)
    setError('')
    if (tab === 'kv') loadKv()
    else if (tab === 'd1') loadD1()
    else loadR2()
  }, [selectedAccount, tab])

  // KV handlers
  const loadKvKeys = (nsId: string) => {
    if (!selectedAccount) return
    setSelectedNs(nsId)
    setKvKeysLoading(true)
    setViewingKey(null)
    api.get(`/cf/${selectedAccount}/kv/namespaces/${nsId}/keys`)
      .then((res) => setKvKeys(res.data?.keys || []))
      .catch(() => setKvKeys([]))
      .finally(() => setKvKeysLoading(false))
  }

  const handleCreateNs = async (e: FormEvent) => {
    e.preventDefault()
    if (!selectedAccount) return
    setNsCreating(true); setError('')
    try {
      await api.post(`/cf/${selectedAccount}/kv/namespaces`, { title: nsTitle })
      setNsTitle(''); setShowCreateNs(false); loadKv()
    } catch (err: unknown) {
      setError((err as { response?: { data?: { error?: string } } })?.response?.data?.error || t.common.failed)
    } finally { setNsCreating(false) }
  }

  const handleDeleteNs = async (nsId: string) => {
    if (!selectedAccount || !confirm(t.storage.deleteConfirm)) return
    try {
      await api.delete(`/cf/${selectedAccount}/kv/namespaces/${nsId}`)
      if (selectedNs === nsId) { setSelectedNs(null); setKvKeys([]) }
      loadKv()
    } catch { /* ignore */ }
  }

  const handleViewKey = async (key: string) => {
    if (!selectedAccount || !selectedNs) return
    setKvValueLoading(true)
    try {
      const res = await api.get(`/cf/${selectedAccount}/kv/namespaces/${selectedNs}/keys/${encodeURIComponent(key)}`)
      setViewingKey({ key, value: res.data?.value || '' })
    } catch {
      setViewingKey({ key, value: '(Failed to load)' })
    } finally { setKvValueLoading(false) }
  }

  const handleAddKey = async (e: FormEvent) => {
    e.preventDefault()
    if (!selectedAccount || !selectedNs) return
    setKeyCreating(true); setError('')
    try {
      await api.put(`/cf/${selectedAccount}/kv/namespaces/${selectedNs}/keys/${encodeURIComponent(newKeyForm.key)}`, newKeyForm.value, {
        headers: { 'Content-Type': 'text/plain' }
      })
      setNewKeyForm({ key: '', value: '' }); setShowAddKey(false)
      loadKvKeys(selectedNs)
    } catch (err: unknown) {
      setError((err as { response?: { data?: { error?: string } } })?.response?.data?.error || t.common.failed)
    } finally { setKeyCreating(false) }
  }

  const handleDeleteKey = async (key: string) => {
    if (!selectedAccount || !selectedNs || !confirm(t.common.deleteConfirm)) return
    try {
      await api.delete(`/cf/${selectedAccount}/kv/namespaces/${selectedNs}/keys/${encodeURIComponent(key)}`)
      if (viewingKey?.key === key) setViewingKey(null)
      loadKvKeys(selectedNs)
    } catch { /* ignore */ }
  }

  // D1 handlers
  const handleCreateDb = async (e: FormEvent) => {
    e.preventDefault()
    if (!selectedAccount) return
    setDbCreating(true); setError('')
    try {
      await api.post(`/cf/${selectedAccount}/d1/databases`, { name: dbName })
      setDbName(''); setShowCreateDb(false); loadD1()
    } catch (err: unknown) {
      setError((err as { response?: { data?: { error?: string } } })?.response?.data?.error || t.common.failed)
    } finally { setDbCreating(false) }
  }

  const handleDeleteDb = async (dbId: string) => {
    if (!selectedAccount || !confirm(t.storage.deleteConfirm)) return
    try {
      await api.delete(`/cf/${selectedAccount}/d1/databases/${dbId}`)
      if (queryDbId === dbId) { setQueryDbId(null); setQueryResult(null) }
      loadD1()
    } catch { /* ignore */ }
  }

  const handleQuery = async (e: FormEvent) => {
    e.preventDefault()
    if (!selectedAccount || !queryDbId) return
    setQuerying(true); setError('')
    try {
      const res = await api.post(`/cf/${selectedAccount}/d1/databases/${queryDbId}/query`, { sql: sqlQuery })
      setQueryResult(res.data)
    } catch (err: unknown) {
      setError((err as { response?: { data?: { error?: string } } })?.response?.data?.error || t.common.failed)
    } finally { setQuerying(false) }
  }

  // R2 handlers
  const handleCreateBucket = async (e: FormEvent) => {
    e.preventDefault()
    if (!selectedAccount) return
    setBucketCreating(true); setError('')
    try {
      await api.post(`/cf/${selectedAccount}/r2/buckets`, bucketForm)
      setBucketForm({ name: '', location: '' }); setShowCreateBucket(false); loadR2()
    } catch (err: unknown) {
      setError((err as { response?: { data?: { error?: string } } })?.response?.data?.error || t.common.failed)
    } finally { setBucketCreating(false) }
  }

  const handleDeleteBucket = async (name: string) => {
    if (!selectedAccount || !confirm(t.storage.deleteConfirm)) return
    try {
      await api.delete(`/cf/${selectedAccount}/r2/buckets/${name}`)
      loadR2()
    } catch { /* ignore */ }
  }

  const tabs: { key: Tab; label: string; color: string }[] = [
    { key: 'kv', label: t.storage.tabKv, color: '#ff006e' },
    { key: 'd1', label: t.storage.tabD1, color: '#3a86ff' },
    { key: 'r2', label: t.storage.tabR2, color: '#06d6a0' },
  ]

  const isLoading = tab === 'kv' ? kvLoading : tab === 'd1' ? d1Loading : r2Loading

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
              onClick={() => { setTab(item.key); setError('') }}
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

        {error && (
          <div className="border-2 border-[#ff006e] bg-[#ff006e] text-white font-bold p-3 mb-4 text-sm font-mono">{error}</div>
        )}

        {isLoading ? (
          <div className="border-2 md:border-4 border-black p-8 text-center font-mono">{t.common.loading}</div>
        ) : (
          <>
            {/* ===== KV TAB ===== */}
            {tab === 'kv' && (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4">
                  <h2 className="font-black text-xl md:text-2xl">{t.storage.tabKv}</h2>
                  <button
                    onClick={() => setShowCreateNs(!showCreateNs)}
                    className="self-start sm:self-auto font-bold uppercase tracking-widest transition-all duration-200 bg-[#ff006e] text-white px-4 py-2 border-2 md:border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] text-xs md:text-sm"
                  >
                    {showCreateNs ? t.common.cancel : t.storage.createNamespace}
                  </button>
                </div>

                {showCreateNs && (
                  <form onSubmit={handleCreateNs} className="border-2 md:border-4 border-black bg-white p-4 md:p-6 mb-6 flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <label className="font-black uppercase tracking-widest text-xs mb-1 block">{t.storage.namespaceName}</label>
                      <input
                        value={nsTitle}
                        onChange={(e) => setNsTitle(e.target.value)}
                        className="w-full border-2 md:border-4 border-black bg-white font-medium focus:outline-none focus:bg-[#ffbe0b] transition-colors duration-200 px-3 py-2 md:px-4 md:py-3 text-sm"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={nsCreating}
                      className="self-end font-bold uppercase tracking-widest transition-all duration-200 bg-[#ff006e] text-white px-6 py-3 border-2 md:border-4 border-black text-sm disabled:opacity-80"
                    >
                      {nsCreating ? t.storage.creating : t.common.create}
                    </button>
                  </form>
                )}

                {kvNamespaces.length === 0 ? (
                  <div className="border-2 md:border-4 border-black p-8 text-center">
                    <p className="font-black text-xl mb-2">{t.storage.noKv}</p>
                    <p className="font-mono text-sm">{accounts.length === 0 ? t.storage.noStorageDescNoAccount : t.storage.noStorageDesc('kv')}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
                    {kvNamespaces.map((ns) => (
                      <div
                        key={ns.id}
                        className={`bg-white border-2 md:border-4 border-black p-4 md:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all ${
                          selectedNs === ns.id ? 'shadow-[4px_4px_0px_0px_rgba(255,0,110,1)] md:shadow-[8px_8px_0px_0px_rgba(255,0,110,1)]' : ''
                        }`}
                      >
                        <h3 className="font-black text-lg mb-2 truncate">{ns.title}</h3>
                        <p className="font-mono text-xs mb-4">{t.storage.kvId}: {ns.id}</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => loadKvKeys(ns.id)}
                            className="font-bold uppercase tracking-widest transition-colors duration-200 bg-white text-black px-3 py-1.5 border-2 border-black text-xs hover:bg-[#ffbe0b]"
                          >
                            {t.storage.viewKeys}
                          </button>
                          <button
                            onClick={() => handleDeleteNs(ns.id)}
                            className="font-bold uppercase tracking-widest transition-colors duration-200 bg-white text-black px-3 py-1.5 border-2 border-black text-xs hover:bg-[#ff006e] hover:text-white"
                          >
                            {t.storage.deleteNamespace}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* KV Keys panel */}
                {selectedNs && (
                  <div className="border-t-2 md:border-t-4 border-black pt-6">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4">
                      <h3 className="font-black text-lg md:text-xl">{t.storage.keys}</h3>
                      <button
                        onClick={() => setShowAddKey(!showAddKey)}
                        className="self-start sm:self-auto font-bold uppercase tracking-widest transition-all duration-200 bg-black text-white px-4 py-2 border-2 border-black text-xs hover:bg-[#ff006e]"
                      >
                        {showAddKey ? t.common.cancel : t.storage.addKey}
                      </button>
                    </div>

                    {showAddKey && (
                      <form onSubmit={handleAddKey} className="border-2 md:border-4 border-black bg-white p-4 md:p-6 mb-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="font-black uppercase tracking-widest text-xs mb-1 block">{t.storage.keyName}</label>
                            <input
                              value={newKeyForm.key}
                              onChange={(e) => setNewKeyForm({ ...newKeyForm, key: e.target.value })}
                              className="w-full border-2 md:border-4 border-black bg-white font-medium focus:outline-none focus:bg-[#ffbe0b] transition-colors duration-200 px-3 py-2 md:px-4 md:py-3 text-sm font-mono"
                              required
                            />
                          </div>
                          <div>
                            <label className="font-black uppercase tracking-widest text-xs mb-1 block">{t.storage.keyValue}</label>
                            <input
                              value={newKeyForm.value}
                              onChange={(e) => setNewKeyForm({ ...newKeyForm, value: e.target.value })}
                              className="w-full border-2 md:border-4 border-black bg-white font-medium focus:outline-none focus:bg-[#ffbe0b] transition-colors duration-200 px-3 py-2 md:px-4 md:py-3 text-sm font-mono"
                              required
                            />
                          </div>
                        </div>
                        <button
                          type="submit"
                          disabled={keyCreating}
                          className="font-bold uppercase tracking-widest transition-all duration-200 bg-[#ff006e] text-white px-6 py-3 border-2 md:border-4 border-black text-sm disabled:opacity-80"
                        >
                          {keyCreating ? t.storage.creating : t.storage.addKey}
                        </button>
                      </form>
                    )}

                    {kvKeysLoading ? (
                      <div className="border-2 md:border-4 border-black p-6 text-center font-mono">{t.common.loading}</div>
                    ) : kvKeys.length === 0 ? (
                      <div className="border-2 md:border-4 border-black p-6 text-center font-mono">{t.common.noData}</div>
                    ) : (
                      <div className="space-y-2">
                        {kvKeys.map((k) => (
                          <div key={k.name} className="bg-white border-2 border-black p-3 flex items-center justify-between gap-4">
                            <span className="font-mono text-sm font-bold truncate">{k.name}</span>
                            <div className="flex gap-2 shrink-0">
                              <button
                                onClick={() => handleViewKey(k.name)}
                                disabled={kvValueLoading}
                                className="font-bold uppercase tracking-widest transition-colors duration-200 bg-white text-black px-2 py-1 border-2 border-black text-xs hover:bg-[#ffbe0b]"
                              >
                                {t.common.edit}
                              </button>
                              <button
                                onClick={() => handleDeleteKey(k.name)}
                                className="font-bold uppercase tracking-widest transition-colors duration-200 bg-white text-black px-2 py-1 border-2 border-black text-xs hover:bg-[#ff006e] hover:text-white"
                              >
                                {t.storage.deleteKey}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* KV value viewer */}
                    {viewingKey && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={() => setViewingKey(null)}>
                        <div className="bg-white border-2 md:border-4 border-black p-6 md:p-8 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
                          <h3 className="font-black text-lg mb-4">{viewingKey.key}</h3>
                          <pre className="border-2 border-black bg-black text-[#06d6a0] p-4 font-mono text-sm whitespace-pre-wrap max-h-64 overflow-auto mb-4">
                            {viewingKey.value}
                          </pre>
                          <button
                            onClick={() => setViewingKey(null)}
                            className="font-bold uppercase tracking-widest transition-all duration-200 bg-white text-black px-4 py-2 border-2 border-black text-xs hover:bg-black hover:text-white"
                          >
                            {t.common.close}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ===== D1 TAB ===== */}
            {tab === 'd1' && (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4">
                  <h2 className="font-black text-xl md:text-2xl">{t.storage.tabD1}</h2>
                  <button
                    onClick={() => setShowCreateDb(!showCreateDb)}
                    className="self-start sm:self-auto font-bold uppercase tracking-widest transition-all duration-200 bg-[#3a86ff] text-white px-4 py-2 border-2 md:border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] text-xs md:text-sm"
                  >
                    {showCreateDb ? t.common.cancel : t.storage.createDatabase}
                  </button>
                </div>

                {showCreateDb && (
                  <form onSubmit={handleCreateDb} className="border-2 md:border-4 border-black bg-white p-4 md:p-6 mb-6 flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <label className="font-black uppercase tracking-widest text-xs mb-1 block">{t.storage.databaseName}</label>
                      <input
                        value={dbName}
                        onChange={(e) => setDbName(e.target.value)}
                        className="w-full border-2 md:border-4 border-black bg-white font-medium focus:outline-none focus:bg-[#ffbe0b] transition-colors duration-200 px-3 py-2 md:px-4 md:py-3 text-sm"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={dbCreating}
                      className="self-end font-bold uppercase tracking-widest transition-all duration-200 bg-[#3a86ff] text-white px-6 py-3 border-2 md:border-4 border-black text-sm disabled:opacity-80"
                    >
                      {dbCreating ? t.storage.creating : t.common.create}
                    </button>
                  </form>
                )}

                {d1Databases.length === 0 ? (
                  <div className="border-2 md:border-4 border-black p-8 text-center">
                    <p className="font-black text-xl mb-2">{t.storage.noD1}</p>
                    <p className="font-mono text-sm">{accounts.length === 0 ? t.storage.noStorageDescNoAccount : t.storage.noStorageDesc('d1')}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
                    {d1Databases.map((db) => (
                      <div
                        key={db.uuid}
                        className={`bg-white border-2 md:border-4 border-black p-4 md:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all ${
                          queryDbId === db.uuid ? 'shadow-[4px_4px_0px_0px_rgba(58,134,255,1)] md:shadow-[8px_8px_0px_0px_rgba(58,134,255,1)]' : ''
                        }`}
                      >
                        <h3 className="font-black text-lg mb-2 truncate">{db.name}</h3>
                        <div className="font-mono text-xs space-y-1 mb-4">
                          <p>{t.storage.d1Uuid}: {db.uuid?.slice(0, 16)}...</p>
                          <p>{t.storage.d1Tables}: {db.num_tables}</p>
                          <p>{t.storage.d1Size}: {((db.file_size || 0) / 1024).toFixed(1)}KB</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => { setQueryDbId(db.uuid); setQueryResult(null); setSqlQuery('') }}
                            className="font-bold uppercase tracking-widest transition-colors duration-200 bg-white text-black px-3 py-1.5 border-2 border-black text-xs hover:bg-[#3a86ff] hover:text-white"
                          >
                            {t.storage.queryDatabase}
                          </button>
                          <button
                            onClick={() => handleDeleteDb(db.uuid)}
                            className="font-bold uppercase tracking-widest transition-colors duration-200 bg-white text-black px-3 py-1.5 border-2 border-black text-xs hover:bg-[#ff006e] hover:text-white"
                          >
                            {t.storage.deleteDatabase}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* D1 SQL Query panel */}
                {queryDbId && (
                  <div className="border-t-2 md:border-t-4 border-black pt-6">
                    <h3 className="font-black text-lg md:text-xl mb-4">{t.storage.sqlQuery}</h3>
                    <form onSubmit={handleQuery} className="space-y-4 mb-4">
                      <textarea
                        value={sqlQuery}
                        onChange={(e) => setSqlQuery(e.target.value)}
                        className="w-full border-2 md:border-4 border-black bg-white font-mono text-sm focus:outline-none focus:bg-[#ffbe0b] transition-colors duration-200 px-3 py-2 md:px-4 md:py-3 min-h-[120px] resize-y"
                        placeholder="SELECT * FROM sqlite_master;"
                        required
                      />
                      <button
                        type="submit"
                        disabled={querying}
                        className="font-bold uppercase tracking-widest transition-all duration-200 bg-[#3a86ff] text-white px-6 py-3 border-2 md:border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] text-sm disabled:opacity-80"
                      >
                        {querying ? t.common.loading : t.storage.runQuery}
                      </button>
                    </form>
                    {queryResult && (
                      <div>
                        <h4 className="font-black text-sm uppercase tracking-widest mb-2">{t.storage.queryResult}</h4>
                        <pre className="border-2 border-black bg-black text-[#06d6a0] p-4 font-mono text-sm whitespace-pre-wrap max-h-96 overflow-auto">
                          {JSON.stringify(queryResult, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ===== R2 TAB ===== */}
            {tab === 'r2' && (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4">
                  <h2 className="font-black text-xl md:text-2xl">{t.storage.tabR2}</h2>
                  <button
                    onClick={() => setShowCreateBucket(!showCreateBucket)}
                    className="self-start sm:self-auto font-bold uppercase tracking-widest transition-all duration-200 bg-[#06d6a0] text-black px-4 py-2 border-2 md:border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] text-xs md:text-sm"
                  >
                    {showCreateBucket ? t.common.cancel : t.storage.createBucket}
                  </button>
                </div>

                {showCreateBucket && (
                  <form onSubmit={handleCreateBucket} className="border-2 md:border-4 border-black bg-white p-4 md:p-6 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="font-black uppercase tracking-widest text-xs mb-1 block">{t.storage.bucketName}</label>
                      <input
                        value={bucketForm.name}
                        onChange={(e) => setBucketForm({ ...bucketForm, name: e.target.value })}
                        className="w-full border-2 md:border-4 border-black bg-white font-medium focus:outline-none focus:bg-[#ffbe0b] transition-colors duration-200 px-3 py-2 md:px-4 md:py-3 text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="font-black uppercase tracking-widest text-xs mb-1 block">{t.storage.bucketLocation}</label>
                      <input
                        value={bucketForm.location}
                        onChange={(e) => setBucketForm({ ...bucketForm, location: e.target.value })}
                        className="w-full border-2 md:border-4 border-black bg-white font-medium focus:outline-none focus:bg-[#ffbe0b] transition-colors duration-200 px-3 py-2 md:px-4 md:py-3 text-sm"
                        placeholder="apac"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="submit"
                        disabled={bucketCreating}
                        className="font-bold uppercase tracking-widest transition-all duration-200 bg-[#06d6a0] text-black px-6 py-3 border-2 md:border-4 border-black text-sm disabled:opacity-80"
                      >
                        {bucketCreating ? t.storage.creating : t.common.create}
                      </button>
                    </div>
                  </form>
                )}

                {r2Buckets.length === 0 ? (
                  <div className="border-2 md:border-4 border-black p-8 text-center">
                    <p className="font-black text-xl mb-2">{t.storage.noR2}</p>
                    <p className="font-mono text-sm">{accounts.length === 0 ? t.storage.noStorageDescNoAccount : t.storage.noStorageDesc('r2')}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {r2Buckets.map((b) => (
                      <div
                        key={b.name}
                        className="bg-white border-2 md:border-4 border-black p-4 md:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all"
                      >
                        <h3 className="font-black text-lg mb-2 truncate">{b.name}</h3>
                        <p className="font-mono text-xs mb-4">
                          {t.storage.r2Location}: {b.location || t.storage.r2LocationDefault}
                        </p>
                        <button
                          onClick={() => handleDeleteBucket(b.name)}
                          className="font-bold uppercase tracking-widest transition-colors duration-200 bg-white text-black px-3 py-1.5 border-2 border-black text-xs hover:bg-[#ff006e] hover:text-white"
                        >
                          {t.storage.deleteBucket}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
