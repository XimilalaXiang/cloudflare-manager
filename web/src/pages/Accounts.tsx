import { useEffect, useState, type FormEvent } from 'react'
import api from '../lib/api'

interface Account {
  id: number
  name: string
  email: string
  account_id: string
  api_token_masked: string
  status: string
}

export default function Accounts() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', account_id: '', api_token: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const loadAccounts = () => {
    api.get('/accounts').then((res) => setAccounts(res.data || [])).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { loadAccounts() }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await api.post('/accounts', form)
      setForm({ name: '', email: '', account_id: '', api_token: '' })
      setShowForm(false)
      loadAccounts()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to add account'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this account?')) return
    await api.delete(`/accounts/${id}`)
    loadAccounts()
  }

  const handleVerify = async (id: number) => {
    try {
      const res = await api.post(`/accounts/${id}/verify`)
      alert(`Status: ${res.data.status}`)
      loadAccounts()
    } catch {
      alert('Verification failed')
    }
  }

  return (
    <div className="py-8 md:py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-8 md:mb-12">
          <div>
            <h1 className="font-black text-3xl md:text-5xl tracking-tight">
              ACC<span className="text-[#3a86ff]">OUNTS</span>
            </h1>
            <p className="font-mono text-sm md:text-base mt-2">
              Manage your Cloudflare accounts
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="font-bold uppercase tracking-widest transition-all duration-200 bg-black text-white px-4 py-2 md:px-6 md:py-3 border-2 md:border-4 border-black shadow-[4px_4px_0px_0px_rgba(58,134,255,1)] md:shadow-[8px_8px_0px_0px_rgba(58,134,255,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] text-xs md:text-sm"
          >
            {showForm ? 'CANCEL' : 'ADD ACCOUNT'}
          </button>
        </div>

        {showForm && (
          <div className="border-2 md:border-4 border-black bg-white p-4 md:p-8 mb-8">
            <h2 className="font-black text-xl md:text-2xl mb-4 md:mb-6">NEW ACCOUNT</h2>
            {error && (
              <div className="border-2 border-[#ff006e] bg-[#ff006e] text-white font-bold p-3 mb-4 text-sm font-mono">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-black uppercase tracking-widest text-xs mb-1 block">NAME</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border-2 md:border-4 border-black bg-white font-medium focus:outline-none focus:bg-[#ffbe0b] transition-colors duration-200 px-3 py-2 md:px-4 md:py-3 text-sm"
                  placeholder="My Account"
                  required
                />
              </div>
              <div>
                <label className="font-black uppercase tracking-widest text-xs mb-1 block">EMAIL</label>
                <input
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border-2 md:border-4 border-black bg-white font-medium focus:outline-none focus:bg-[#ffbe0b] transition-colors duration-200 px-3 py-2 md:px-4 md:py-3 text-sm"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="font-black uppercase tracking-widest text-xs mb-1 block">ACCOUNT ID</label>
                <input
                  value={form.account_id}
                  onChange={(e) => setForm({ ...form, account_id: e.target.value })}
                  className="w-full border-2 md:border-4 border-black bg-white font-medium focus:outline-none focus:bg-[#ffbe0b] transition-colors duration-200 px-3 py-2 md:px-4 md:py-3 text-sm font-mono"
                  placeholder="Cloudflare Account ID"
                  required
                />
              </div>
              <div>
                <label className="font-black uppercase tracking-widest text-xs mb-1 block">API TOKEN</label>
                <input
                  type="password"
                  value={form.api_token}
                  onChange={(e) => setForm({ ...form, api_token: e.target.value })}
                  className="w-full border-2 md:border-4 border-black bg-white font-medium focus:outline-none focus:bg-[#ffbe0b] transition-colors duration-200 px-3 py-2 md:px-4 md:py-3 text-sm font-mono"
                  placeholder="Cloudflare API Token"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="font-bold uppercase tracking-widest transition-all duration-200 bg-[#3a86ff] text-white px-6 py-3 border-2 md:border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] active:scale-95 text-sm disabled:opacity-80"
                >
                  {submitting ? 'ADDING...' : 'ADD ACCOUNT'}
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="border-2 md:border-4 border-black p-8 text-center font-mono">Loading...</div>
        ) : accounts.length === 0 ? (
          <div className="border-2 md:border-4 border-black p-8 md:p-12 text-center">
            <p className="font-black text-xl md:text-2xl mb-2">NO ACCOUNTS</p>
            <p className="font-mono text-sm">Click "ADD ACCOUNT" to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="bg-white border-2 md:border-4 border-black p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-black text-lg">{account.name}</h3>
                    <span
                      className={`font-mono text-xs font-bold px-2 py-0.5 border-2 border-black ${
                        account.status === 'active'
                          ? 'bg-[#06d6a0] text-black'
                          : 'bg-[#ff006e] text-white'
                      }`}
                    >
                      {account.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="font-mono text-sm">{account.email || '—'}</p>
                  <p className="font-mono text-xs mt-1">
                    ID: <span className="font-bold">{account.account_id}</span> · Token: {account.api_token_masked}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleVerify(account.id)}
                    className="font-bold uppercase tracking-widest transition-colors duration-200 bg-white text-black px-3 py-1.5 border-2 border-black text-xs hover:bg-[#ffbe0b]"
                  >
                    VERIFY
                  </button>
                  <button
                    onClick={() => handleDelete(account.id)}
                    className="font-bold uppercase tracking-widest transition-colors duration-200 bg-white text-black px-3 py-1.5 border-2 border-black text-xs hover:bg-[#ff006e] hover:text-white"
                  >
                    DELETE
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
