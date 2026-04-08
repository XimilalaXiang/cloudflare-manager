import { useEffect, useState } from 'react'
import api from '../lib/api'

interface Account { id: number; name: string }
interface Zone { id: string; name: string; status: string; paused: boolean; name_servers: string[] }
interface DNSRecord { id: string; type: string; name: string; content: string; ttl: number; proxied: boolean }

export default function Zones() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [selectedAccount, setSelectedAccount] = useState<number | null>(null)
  const [zones, setZones] = useState<Zone[]>([])
  const [selectedZone, setSelectedZone] = useState<string | null>(null)
  const [records, setRecords] = useState<DNSRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingRecords, setLoadingRecords] = useState(false)

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

  useEffect(() => {
    if (!selectedAccount || !selectedZone) return
    setLoadingRecords(true)
    api.get(`/cf/${selectedAccount}/zones/${selectedZone}/dns`)
      .then((res) => setRecords(res.data || []))
      .catch(() => setRecords([]))
      .finally(() => setLoadingRecords(false))
  }, [selectedAccount, selectedZone])

  return (
    <div className="py-8 md:py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="font-black text-3xl md:text-5xl tracking-tight mb-2">
          ZO<span className="text-[#06d6a0]">NES</span>
        </h1>
        <p className="font-mono text-sm md:text-base mb-8">Manage zones and DNS records</p>

        {accounts.length > 0 && (
          <div className="mb-8">
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

        {loading ? (
          <div className="border-2 md:border-4 border-black p-8 text-center font-mono">Loading zones...</div>
        ) : zones.length === 0 ? (
          <div className="border-2 md:border-4 border-black p-8 text-center">
            <p className="font-black text-xl mb-2">NO ZONES</p>
            <p className="font-mono text-sm">
              {accounts.length === 0 ? 'Add an account first.' : 'No zones found.'}
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
                <h3 className="font-black text-lg md:text-xl mb-1">{z.name}</h3>
                <div className="flex items-center gap-2">
                  <span
                    className={`font-mono text-xs font-bold px-2 py-0.5 border-2 border-black ${
                      z.status === 'active' ? 'bg-[#06d6a0]' : 'bg-[#ffbe0b]'
                    }`}
                  >
                    {z.status.toUpperCase()}
                  </span>
                  {z.paused && (
                    <span className="font-mono text-xs font-bold px-2 py-0.5 border-2 border-black bg-[#ff006e] text-white">
                      PAUSED
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {selectedZone && (
          <div>
            <h2 className="font-black text-xl md:text-3xl mb-4">DNS RECORDS</h2>
            {loadingRecords ? (
              <div className="border-2 md:border-4 border-black p-8 text-center font-mono">Loading records...</div>
            ) : records.length === 0 ? (
              <div className="border-2 md:border-4 border-black p-6 text-center font-mono">No DNS records.</div>
            ) : (
              <div className="border-2 md:border-4 border-black overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-black text-white">
                      <th className="font-black uppercase tracking-widest text-xs px-4 py-3">TYPE</th>
                      <th className="font-black uppercase tracking-widest text-xs px-4 py-3">NAME</th>
                      <th className="font-black uppercase tracking-widest text-xs px-4 py-3">CONTENT</th>
                      <th className="font-black uppercase tracking-widest text-xs px-4 py-3">TTL</th>
                      <th className="font-black uppercase tracking-widest text-xs px-4 py-3">PROXY</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((r) => (
                      <tr key={r.id} className="border-t-2 border-black hover:bg-[#ffbe0b] transition-colors duration-200">
                        <td className="px-4 py-3 font-bold font-mono text-sm">
                          <span className="bg-black text-white px-2 py-0.5 text-xs">{r.type}</span>
                        </td>
                        <td className="px-4 py-3 font-mono text-sm">{r.name}</td>
                        <td className="px-4 py-3 font-mono text-sm max-w-xs truncate">{r.content}</td>
                        <td className="px-4 py-3 font-mono text-sm">{r.ttl === 1 ? 'Auto' : r.ttl}</td>
                        <td className="px-4 py-3 font-mono text-sm">
                          <span className={`font-bold ${r.proxied ? 'text-[#06d6a0]' : 'text-black'}`}>
                            {r.proxied ? 'ON' : 'OFF'}
                          </span>
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
