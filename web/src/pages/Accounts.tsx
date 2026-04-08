import { useEffect, useState, type FormEvent } from 'react'
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

export default function Accounts() {
  const { t } = useI18n()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [form, setForm] = useState({ name: '', email: '', account_id: '', api_token: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const loadAccounts = () => {
    api.get('/accounts').then((res) => setAccounts(res.data || [])).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { loadAccounts() }, [])

  const resetForm = () => {
    setForm({ name: '', email: '', account_id: '', api_token: '' })
    setEditingAccount(null)
    setShowForm(false)
    setError('')
  }

  const startEdit = (account: Account) => {
    setEditingAccount(account)
    setForm({ name: account.name, email: account.email, account_id: account.account_id, api_token: '' })
    setShowForm(true)
    setError('')
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      if (editingAccount) {
        const payload: Record<string, string> = { name: form.name, email: form.email }
        if (form.api_token) payload.api_token = form.api_token
        await api.put(`/accounts/${editingAccount.id}`, payload)
      } else {
        await api.post('/accounts', form)
      }
      resetForm()
      loadAccounts()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || (editingAccount ? t.accounts.failedToUpdate : t.accounts.failedToAdd)
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm(t.accounts.deleteConfirm)) return
    await api.delete(`/accounts/${id}`)
    loadAccounts()
  }

  const handleVerify = async (id: number) => {
    try {
      const res = await api.post(`/accounts/${id}/verify`)
      alert(`${t.accounts.verifySuccess}: ${res.data.status}`)
      loadAccounts()
    } catch {
      alert(t.accounts.verifyFailed)
    }
  }

  return (
    <div className="py-8 md:py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 md:mb-12">
          <div>
            <h1 className="font-black text-3xl md:text-5xl tracking-tight">
              {t.accounts.title}<span className="text-[#3a86ff]">{t.accounts.titleHighlight}</span>
            </h1>
            <p className="font-mono text-sm md:text-base mt-2">
              {t.accounts.subtitle}
            </p>
          </div>
          <button
            onClick={() => { if (showForm) resetForm(); else { setEditingAccount(null); setForm({ name: '', email: '', account_id: '', api_token: '' }); setShowForm(true) } }}
            className="self-start sm:self-auto font-bold uppercase tracking-widest transition-all duration-200 bg-black text-white px-4 py-2 md:px-6 md:py-3 border-2 md:border-4 border-black shadow-[4px_4px_0px_0px_rgba(58,134,255,1)] md:shadow-[8px_8px_0px_0px_rgba(58,134,255,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] text-xs md:text-sm"
          >
            {showForm ? t.accounts.cancelAdd : t.accounts.addAccount}
          </button>
        </div>

        {showForm && (
          <div className="border-2 md:border-4 border-black bg-white p-4 md:p-8 mb-8">
            <h2 className="font-black text-xl md:text-2xl mb-4 md:mb-6">
              {editingAccount ? t.accounts.editAccount : t.accounts.newAccount}
            </h2>
            {error && (
              <div className="border-2 border-[#ff006e] bg-[#ff006e] text-white font-bold p-3 mb-4 text-sm font-mono">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-black uppercase tracking-widest text-xs mb-1 block">{t.accounts.fieldName}</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border-2 md:border-4 border-black bg-white font-medium focus:outline-none focus:bg-[#ffbe0b] transition-colors duration-200 px-3 py-2 md:px-4 md:py-3 text-sm"
                  placeholder={t.accounts.namePlaceholder}
                  required
                />
              </div>
              <div>
                <label className="font-black uppercase tracking-widest text-xs mb-1 block">{t.accounts.fieldEmail}</label>
                <input
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border-2 md:border-4 border-black bg-white font-medium focus:outline-none focus:bg-[#ffbe0b] transition-colors duration-200 px-3 py-2 md:px-4 md:py-3 text-sm"
                  placeholder={t.accounts.emailPlaceholder}
                />
              </div>
              {!editingAccount && (
                <div>
                  <label className="font-black uppercase tracking-widest text-xs mb-1 block">{t.accounts.fieldAccountId}</label>
                  <input
                    value={form.account_id}
                    onChange={(e) => setForm({ ...form, account_id: e.target.value })}
                    className="w-full border-2 md:border-4 border-black bg-white font-medium focus:outline-none focus:bg-[#ffbe0b] transition-colors duration-200 px-3 py-2 md:px-4 md:py-3 text-sm font-mono"
                    placeholder={t.accounts.accountIdPlaceholder}
                    required
                  />
                </div>
              )}
              <div>
                <label className="font-black uppercase tracking-widest text-xs mb-1 block">{t.accounts.fieldApiToken}</label>
                <input
                  type="password"
                  value={form.api_token}
                  onChange={(e) => setForm({ ...form, api_token: e.target.value })}
                  className="w-full border-2 md:border-4 border-black bg-white font-medium focus:outline-none focus:bg-[#ffbe0b] transition-colors duration-200 px-3 py-2 md:px-4 md:py-3 text-sm font-mono"
                  placeholder={editingAccount ? t.accounts.apiTokenUpdateHint : t.accounts.apiTokenPlaceholder}
                  required={!editingAccount}
                />
              </div>
              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="font-bold uppercase tracking-widest transition-all duration-200 bg-[#3a86ff] text-white px-6 py-3 border-2 md:border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] active:scale-95 text-sm disabled:opacity-80"
                >
                  {submitting ? (editingAccount ? t.accounts.saving : t.accounts.adding) : (editingAccount ? t.common.save : t.accounts.addAccount)}
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="border-2 md:border-4 border-black p-8 text-center font-mono">{t.common.loading}</div>
        ) : accounts.length === 0 ? (
          <div className="border-2 md:border-4 border-black p-8 md:p-12 text-center">
            <p className="font-black text-xl md:text-2xl mb-2">{t.accounts.noAccounts}</p>
            <p className="font-mono text-sm">{t.accounts.noAccountsDesc}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="bg-white border-2 md:border-4 border-black p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-black text-lg truncate">{account.name}</h3>
                    <span
                      className={`font-mono text-xs font-bold px-2 py-0.5 border-2 border-black shrink-0 ${
                        account.status === 'active'
                          ? 'bg-[#06d6a0] text-black'
                          : 'bg-[#ff006e] text-white'
                      }`}
                    >
                      {account.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="font-mono text-sm truncate">{account.email || '—'}</p>
                  <p className="font-mono text-xs mt-1 truncate">
                    ID: <span className="font-bold">{account.account_id}</span> · Token: {account.api_token_masked}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => startEdit(account)}
                    className="font-bold uppercase tracking-widest transition-colors duration-200 bg-white text-black px-3 py-1.5 border-2 border-black text-xs hover:bg-[#3a86ff] hover:text-white"
                  >
                    {t.common.edit}
                  </button>
                  <button
                    onClick={() => handleVerify(account.id)}
                    className="font-bold uppercase tracking-widest transition-colors duration-200 bg-white text-black px-3 py-1.5 border-2 border-black text-xs hover:bg-[#ffbe0b]"
                  >
                    {t.common.verify}
                  </button>
                  <button
                    onClick={() => handleDelete(account.id)}
                    className="font-bold uppercase tracking-widest transition-colors duration-200 bg-white text-black px-3 py-1.5 border-2 border-black text-xs hover:bg-[#ff006e] hover:text-white"
                  >
                    {t.common.delete}
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
