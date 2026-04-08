import { useEffect, useState, type FormEvent } from 'react'
import api from '../lib/api'
import { useI18n } from '../i18n'

interface Account { id: number; name: string }
interface Zone { id: string; name: string; status: string; paused: boolean; name_servers: string[] }
interface DNSRecord { id: string; type: string; name: string; content: string; ttl: number; proxied: boolean }

const DNS_TYPES = ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS', 'SRV', 'CAA']

export default function Zones() {
  const { t } = useI18n()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [selectedAccount, setSelectedAccount] = useState<number | null>(null)
  const [zones, setZones] = useState<Zone[]>([])
  const [selectedZone, setSelectedZone] = useState<string | null>(null)
  const [records, setRecords] = useState<DNSRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingRecords, setLoadingRecords] = useState(false)

  const [showDnsForm, setShowDnsForm] = useState(false)
  const [editingRecord, setEditingRecord] = useState<DNSRecord | null>(null)
  const [dnsForm, setDnsForm] = useState({ type: 'A', name: '', content: '', ttl: 1, proxied: false })
  const [dnsSubmitting, setDnsSubmitting] = useState(false)
  const [dnsError, setDnsError] = useState('')

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
    setRecords([])
    api.get(`/cf/${selectedAccount}/zones`)
      .then((res) => setZones(res.data || []))
      .catch(() => setZones([]))
      .finally(() => setLoading(false))
  }, [selectedAccount])

  const loadRecords = () => {
    if (!selectedAccount || !selectedZone) return
    setLoadingRecords(true)
    api.get(`/cf/${selectedAccount}/zones/${selectedZone}/dns`)
      .then((res) => setRecords(res.data || []))
      .catch(() => setRecords([]))
      .finally(() => setLoadingRecords(false))
  }

  useEffect(() => { loadRecords() }, [selectedAccount, selectedZone])

  const resetDnsForm = () => {
    setDnsForm({ type: 'A', name: '', content: '', ttl: 1, proxied: false })
    setEditingRecord(null)
    setShowDnsForm(false)
    setDnsError('')
  }

  const startEditRecord = (record: DNSRecord) => {
    setEditingRecord(record)
    setDnsForm({ type: record.type, name: record.name, content: record.content, ttl: record.ttl, proxied: record.proxied })
    setShowDnsForm(true)
    setDnsError('')
  }

  const handleDnsSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!selectedAccount || !selectedZone) return
    setDnsSubmitting(true)
    setDnsError('')
    try {
      if (editingRecord) {
        await api.put(`/cf/${selectedAccount}/zones/${selectedZone}/dns/${editingRecord.id}`, dnsForm)
      } else {
        await api.post(`/cf/${selectedAccount}/zones/${selectedZone}/dns`, dnsForm)
      }
      resetDnsForm()
      loadRecords()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || t.common.failed
      setDnsError(msg)
    } finally {
      setDnsSubmitting(false)
    }
  }

  const handleDeleteRecord = async (recordId: string) => {
    if (!selectedAccount || !selectedZone || !confirm(t.zones.deleteRecordConfirm)) return
    try {
      await api.delete(`/cf/${selectedAccount}/zones/${selectedZone}/dns/${recordId}`)
      loadRecords()
    } catch { /* ignore */ }
  }

  return (
    <div className="py-8 md:py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="font-black text-3xl md:text-5xl tracking-tight mb-2">
          {t.zones.title}<span className="text-[#06d6a0]">{t.zones.titleHighlight}</span>
        </h1>
        <p className="font-mono text-sm md:text-base mb-8">{t.zones.subtitle}</p>

        {accounts.length > 0 && (
          <div className="mb-8">
            <label className="font-black uppercase tracking-widest text-xs mb-2 block">{t.zones.selectAccount}</label>
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
          <div className="border-2 md:border-4 border-black p-8 text-center font-mono">{t.zones.loadingZones}</div>
        ) : zones.length === 0 ? (
          <div className="border-2 md:border-4 border-black p-8 text-center">
            <p className="font-black text-xl mb-2">{t.zones.noZones}</p>
            <p className="font-mono text-sm">
              {accounts.length === 0 ? t.zones.noZonesDescNoAccount : t.zones.noZonesDesc}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
            {zones.map((z) => (
              <button
                key={z.id}
                onClick={() => setSelectedZone(z.id)}
                className={`text-left bg-white border-2 md:border-4 border-black p-4 md:p-6 transition-all hover:-translate-y-1 ${
                  selectedZone === z.id
                    ? 'shadow-[4px_4px_0px_0px_rgba(6,214,160,1)] md:shadow-[8px_8px_0px_0px_rgba(6,214,160,1)]'
                    : 'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(6,214,160,1)] md:hover:shadow-[8px_8px_0px_0px_rgba(6,214,160,1)]'
                }`}
              >
                <h3 className="font-black text-lg md:text-xl mb-1 truncate">{z.name}</h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`font-mono text-xs font-bold px-2 py-0.5 border-2 border-black ${
                      z.status === 'active' ? 'bg-[#06d6a0]' : 'bg-[#ffbe0b]'
                    }`}
                  >
                    {z.status.toUpperCase()}
                  </span>
                  {z.paused && (
                    <span className="font-mono text-xs font-bold px-2 py-0.5 border-2 border-black bg-[#ff006e] text-white">
                      {t.zones.paused}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {selectedZone && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4">
              <h2 className="font-black text-xl md:text-3xl">{t.zones.dnsRecords}</h2>
              <button
                onClick={() => { if (showDnsForm) resetDnsForm(); else { setEditingRecord(null); setDnsForm({ type: 'A', name: '', content: '', ttl: 1, proxied: false }); setShowDnsForm(true) } }}
                className="self-start sm:self-auto font-bold uppercase tracking-widest transition-all duration-200 bg-[#06d6a0] text-black px-4 py-2 border-2 md:border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] text-xs md:text-sm"
              >
                {showDnsForm ? t.common.cancel : t.zones.addRecord}
              </button>
            </div>

            {showDnsForm && (
              <div className="border-2 md:border-4 border-black bg-white p-4 md:p-8 mb-6">
                <h3 className="font-black text-lg md:text-xl mb-4">
                  {editingRecord ? t.zones.editRecord : t.zones.addRecord}
                </h3>
                {dnsError && (
                  <div className="border-2 border-[#ff006e] bg-[#ff006e] text-white font-bold p-3 mb-4 text-sm font-mono">{dnsError}</div>
                )}
                <form onSubmit={handleDnsSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="font-black uppercase tracking-widest text-xs mb-1 block">{t.zones.colType}</label>
                    <select
                      value={dnsForm.type}
                      onChange={(e) => setDnsForm({ ...dnsForm, type: e.target.value })}
                      className="w-full border-2 md:border-4 border-black bg-white font-medium focus:outline-none focus:bg-[#ffbe0b] transition-colors duration-200 px-3 py-2 md:px-4 md:py-3 text-sm"
                    >
                      {DNS_TYPES.map((dt) => <option key={dt} value={dt}>{dt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="font-black uppercase tracking-widest text-xs mb-1 block">{t.zones.colName}</label>
                    <input
                      value={dnsForm.name}
                      onChange={(e) => setDnsForm({ ...dnsForm, name: e.target.value })}
                      className="w-full border-2 md:border-4 border-black bg-white font-medium focus:outline-none focus:bg-[#ffbe0b] transition-colors duration-200 px-3 py-2 md:px-4 md:py-3 text-sm font-mono"
                      placeholder={t.zones.namePlaceholder}
                      required
                    />
                  </div>
                  <div>
                    <label className="font-black uppercase tracking-widest text-xs mb-1 block">{t.zones.colContent}</label>
                    <input
                      value={dnsForm.content}
                      onChange={(e) => setDnsForm({ ...dnsForm, content: e.target.value })}
                      className="w-full border-2 md:border-4 border-black bg-white font-medium focus:outline-none focus:bg-[#ffbe0b] transition-colors duration-200 px-3 py-2 md:px-4 md:py-3 text-sm font-mono"
                      placeholder={t.zones.contentPlaceholder}
                      required
                    />
                  </div>
                  <div>
                    <label className="font-black uppercase tracking-widest text-xs mb-1 block">{t.zones.colTtl}</label>
                    <input
                      type="number"
                      value={dnsForm.ttl}
                      onChange={(e) => setDnsForm({ ...dnsForm, ttl: Number(e.target.value) })}
                      className="w-full border-2 md:border-4 border-black bg-white font-medium focus:outline-none focus:bg-[#ffbe0b] transition-colors duration-200 px-3 py-2 md:px-4 md:py-3 text-sm font-mono"
                      placeholder={t.zones.ttlPlaceholder}
                      min={1}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 font-mono text-sm">
                      <input
                        type="checkbox"
                        checked={dnsForm.proxied}
                        onChange={(e) => setDnsForm({ ...dnsForm, proxied: e.target.checked })}
                        className="w-5 h-5 border-2 border-black accent-[#06d6a0]"
                      />
                      {t.zones.proxied}
                    </label>
                  </div>
                  <div className="lg:col-span-3 flex gap-3">
                    <button
                      type="submit"
                      disabled={dnsSubmitting}
                      className="font-bold uppercase tracking-widest transition-all duration-200 bg-[#06d6a0] text-black px-6 py-3 border-2 md:border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] text-sm disabled:opacity-80"
                    >
                      {dnsSubmitting ? t.zones.saving : (editingRecord ? t.common.save : t.common.create)}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {loadingRecords ? (
              <div className="border-2 md:border-4 border-black p-8 text-center font-mono">{t.zones.loadingRecords}</div>
            ) : records.length === 0 ? (
              <div className="border-2 md:border-4 border-black p-6 text-center font-mono">{t.zones.noRecords}</div>
            ) : (
              <div className="border-2 md:border-4 border-black overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-black text-white">
                      <th className="font-black uppercase tracking-widest text-xs px-4 py-3">{t.zones.colType}</th>
                      <th className="font-black uppercase tracking-widest text-xs px-4 py-3">{t.zones.colName}</th>
                      <th className="font-black uppercase tracking-widest text-xs px-4 py-3">{t.zones.colContent}</th>
                      <th className="font-black uppercase tracking-widest text-xs px-4 py-3">{t.zones.colTtl}</th>
                      <th className="font-black uppercase tracking-widest text-xs px-4 py-3">{t.zones.colProxy}</th>
                      <th className="font-black uppercase tracking-widest text-xs px-4 py-3">{t.common.actions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((r) => (
                      <tr key={r.id} className="border-t-2 border-black hover:bg-[#ffbe0b]/20 transition-colors duration-200">
                        <td className="px-4 py-3 font-bold font-mono text-sm">
                          <span className="bg-black text-white px-2 py-0.5 text-xs">{r.type}</span>
                        </td>
                        <td className="px-4 py-3 font-mono text-sm">{r.name}</td>
                        <td className="px-4 py-3 font-mono text-sm max-w-xs truncate">{r.content}</td>
                        <td className="px-4 py-3 font-mono text-sm">{r.ttl === 1 ? t.zones.ttlAuto : r.ttl}</td>
                        <td className="px-4 py-3 font-mono text-sm">
                          <span className={`font-bold ${r.proxied ? 'text-[#06d6a0]' : 'text-black'}`}>
                            {r.proxied ? t.zones.proxyOn : t.zones.proxyOff}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => startEditRecord(r)}
                              className="font-bold uppercase tracking-widest transition-colors duration-200 bg-white text-black px-2 py-1 border-2 border-black text-xs hover:bg-[#3a86ff] hover:text-white"
                            >
                              {t.zones.editRecord}
                            </button>
                            <button
                              onClick={() => handleDeleteRecord(r.id)}
                              className="font-bold uppercase tracking-widest transition-colors duration-200 bg-white text-black px-2 py-1 border-2 border-black text-xs hover:bg-[#ff006e] hover:text-white"
                            >
                              {t.zones.deleteRecord}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
