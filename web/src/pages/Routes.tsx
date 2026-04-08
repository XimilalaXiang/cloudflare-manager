import { useEffect, useState, type FormEvent } from 'react'
import api from '../lib/api'
import { useI18n } from '../i18n'

interface Account { id: number; name: string }
interface Zone { id: string; name: string }
interface WorkerRoute { id: string; pattern: string; script: string }

export default function RoutesPage() {
  const { t } = useI18n()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [selectedAccount, setSelectedAccount] = useState<number | null>(null)
  const [zones, setZones] = useState<Zone[]>([])
  const [selectedZone, setSelectedZone] = useState<string | null>(null)
  const [routes, setRoutes] = useState<WorkerRoute[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingRoutes, setLoadingRoutes] = useState(false)

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ pattern: '', script: '' })
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

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
    setSelectedZone(null)
    setRoutes([])
    api.get(`/cf/${selectedAccount}/zones`)
      .then((res) => setZones(res.data || []))
      .catch(() => setZones([]))
      .finally(() => setLoading(false))
  }, [selectedAccount])

  const loadRoutes = () => {
    if (!selectedAccount || !selectedZone) return
    setLoadingRoutes(true)
    api.get(`/cf/${selectedAccount}/zones/${selectedZone}/routes`)
      .then((res) => setRoutes(res.data || []))
      .catch(() => setRoutes([]))
      .finally(() => setLoadingRoutes(false))
  }

  useEffect(() => { loadRoutes() }, [selectedAccount, selectedZone])

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault()
    if (!selectedAccount || !selectedZone) return
    setCreating(true)
    setError('')
    try {
      await api.post(`/cf/${selectedAccount}/zones/${selectedZone}/routes`, form)
      setForm({ pattern: '', script: '' })
      setShowForm(false)
      loadRoutes()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || t.common.failed
      setError(msg)
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (routeId: string) => {
    if (!selectedAccount || !selectedZone || !confirm(t.routes.deleteConfirm)) return
    try {
      await api.delete(`/cf/${selectedAccount}/zones/${selectedZone}/routes/${routeId}`)
      loadRoutes()
    } catch { /* ignore */ }
  }

  return (
    <div className="py-8 md:py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="font-black text-3xl md:text-5xl tracking-tight mb-2">
          {t.routes.title}<span className="text-[#8338ec]">{t.routes.titleHighlight}</span>
        </h1>
        <p className="font-mono text-sm md:text-base mb-8">{t.routes.subtitle}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {accounts.length > 0 && (
            <div>
              <label className="font-black uppercase tracking-widest text-xs mb-2 block">{t.routes.selectAccount}</label>
              <select
                value={selectedAccount || ''}
                onChange={(e) => setSelectedAccount(Number(e.target.value))}
                className="w-full border-2 md:border-4 border-black bg-white font-medium focus:outline-none focus:bg-[#ffbe0b] transition-colors duration-200 px-3 py-2 md:px-4 md:py-3 text-sm"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
          )}
          {zones.length > 0 && (
            <div>
              <label className="font-black uppercase tracking-widest text-xs mb-2 block">{t.routes.selectZone}</label>
              <select
                value={selectedZone || ''}
                onChange={(e) => setSelectedZone(e.target.value || null)}
                className="w-full border-2 md:border-4 border-black bg-white font-medium focus:outline-none focus:bg-[#ffbe0b] transition-colors duration-200 px-3 py-2 md:px-4 md:py-3 text-sm"
              >
                <option value="">—</option>
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>{z.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {selectedZone && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4">
              <h2 className="font-black text-xl md:text-3xl">{t.routes.title}{t.routes.titleHighlight}</h2>
              <button
                onClick={() => setShowForm(!showForm)}
                className="self-start sm:self-auto font-bold uppercase tracking-widest transition-all duration-200 bg-[#8338ec] text-white px-4 py-2 border-2 md:border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] text-xs md:text-sm"
              >
                {showForm ? t.common.cancel : t.routes.addRoute}
              </button>
            </div>

            {showForm && (
              <div className="border-2 md:border-4 border-black bg-white p-4 md:p-8 mb-6">
                {error && (
                  <div className="border-2 border-[#ff006e] bg-[#ff006e] text-white font-bold p-3 mb-4 text-sm font-mono">{error}</div>
                )}
                <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-black uppercase tracking-widest text-xs mb-1 block">{t.routes.pattern}</label>
                    <input
                      value={form.pattern}
                      onChange={(e) => setForm({ ...form, pattern: e.target.value })}
                      className="w-full border-2 md:border-4 border-black bg-white font-medium focus:outline-none focus:bg-[#ffbe0b] transition-colors duration-200 px-3 py-2 md:px-4 md:py-3 text-sm font-mono"
                      placeholder={t.routes.patternPlaceholder}
                      required
                    />
                  </div>
                  <div>
                    <label className="font-black uppercase tracking-widest text-xs mb-1 block">{t.routes.script}</label>
                    <input
                      value={form.script}
                      onChange={(e) => setForm({ ...form, script: e.target.value })}
                      className="w-full border-2 md:border-4 border-black bg-white font-medium focus:outline-none focus:bg-[#ffbe0b] transition-colors duration-200 px-3 py-2 md:px-4 md:py-3 text-sm font-mono"
                      placeholder={t.routes.scriptPlaceholder}
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <button
                      type="submit"
                      disabled={creating}
                      className="font-bold uppercase tracking-widest transition-all duration-200 bg-[#8338ec] text-white px-6 py-3 border-2 md:border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] text-sm disabled:opacity-80"
                    >
                      {creating ? t.routes.creating : t.routes.addRoute}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {loading || loadingRoutes ? (
              <div className="border-2 md:border-4 border-black p-8 text-center font-mono">{t.routes.loadingRoutes}</div>
            ) : routes.length === 0 ? (
              <div className="border-2 md:border-4 border-black p-8 text-center">
                <p className="font-black text-xl mb-2">{t.routes.noRoutes}</p>
                <p className="font-mono text-sm">{t.routes.noRoutesDesc}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {routes.map((r) => (
                  <div
                    key={r.id}
                    className="bg-white border-2 md:border-4 border-black p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-sm font-bold truncate">{r.pattern}</p>
                      <p className="font-mono text-xs mt-1">
                        {t.routes.script}: <span className="font-bold">{r.script || '—'}</span>
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="self-start font-bold uppercase tracking-widest transition-colors duration-200 bg-white text-black px-3 py-1.5 border-2 border-black text-xs hover:bg-[#ff006e] hover:text-white"
                    >
                      {t.routes.deleteRoute}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {!selectedZone && zones.length > 0 && (
          <div className="border-2 md:border-4 border-black p-8 text-center font-mono">
            {t.routes.selectZone}
          </div>
        )}
      </div>
    </div>
  )
}
