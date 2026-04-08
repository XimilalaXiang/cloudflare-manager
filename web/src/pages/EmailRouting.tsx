import { useState, useEffect, type FormEvent } from 'react'
import api from '../lib/api'
import { useI18n } from '../i18n'

interface Account { id: number; name: string; status: string }
interface Zone { id: string; name: string; status: string }
interface EmailSettings { enabled: boolean; name: string; tag: string }
interface RuleMatcher { type: string; field: string; value: string }
interface RuleAction { type: string; value: string[] }
interface EmailRule {
  id: string; name: string; priority: number; enabled: boolean
  matchers: RuleMatcher[]; actions: RuleAction[]
}
interface DestAddress { id: string; email: string; verified: string; created: string; modified: string }
interface CatchAll { enabled: boolean; matchers: RuleMatcher[]; actions: RuleAction[] }

export default function EmailRouting() {
  const { t } = useI18n()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [selectedAccount, setSelectedAccount] = useState<number | null>(null)
  const [zones, setZones] = useState<Zone[]>([])
  const [selectedZone, setSelectedZone] = useState<string | null>(null)

  const [settings, setSettings] = useState<EmailSettings | null>(null)
  const [loadingSettings, setLoadingSettings] = useState(false)

  const [rules, setRules] = useState<EmailRule[]>([])
  const [loadingRules, setLoadingRules] = useState(false)
  const [showAddRule, setShowAddRule] = useState(false)
  const [ruleForm, setRuleForm] = useState({ name: '', priority: 0, matchValue: '', forwardTo: '' })
  const [creatingRule, setCreatingRule] = useState(false)

  const [addresses, setAddresses] = useState<DestAddress[]>([])
  const [loadingAddresses, setLoadingAddresses] = useState(false)
  const [showAddAddr, setShowAddAddr] = useState(false)
  const [addrEmail, setAddrEmail] = useState('')
  const [creatingAddr, setCreatingAddr] = useState(false)

  const [catchAll, setCatchAll] = useState<CatchAll | null>(null)
  const [loadingCatchAll, setLoadingCatchAll] = useState(false)

  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/accounts').then(r => setAccounts(r.data || []))
  }, [])

  useEffect(() => {
    if (!selectedAccount) { setZones([]); setSelectedZone(null); return }
    api.get(`/cf/${selectedAccount}/zones`).then(r => setZones(r.data || []))
    setLoadingAddresses(true)
    api.get(`/cf/${selectedAccount}/email-routing/addresses`)
      .then(r => setAddresses(r.data || []))
      .catch(() => setAddresses([]))
      .finally(() => setLoadingAddresses(false))
  }, [selectedAccount])

  useEffect(() => {
    if (!selectedAccount || !selectedZone) {
      setSettings(null); setRules([]); setCatchAll(null); return
    }
    setError('')
    setLoadingSettings(true)
    api.get(`/cf/${selectedAccount}/email-routing/zones/${selectedZone}/settings`)
      .then(r => setSettings(r.data))
      .catch(e => setError(e.response?.data?.error || t.common.failed))
      .finally(() => setLoadingSettings(false))

    setLoadingRules(true)
    api.get(`/cf/${selectedAccount}/email-routing/zones/${selectedZone}/rules`)
      .then(r => setRules(r.data || []))
      .catch(() => setRules([]))
      .finally(() => setLoadingRules(false))

    setLoadingCatchAll(true)
    api.get(`/cf/${selectedAccount}/email-routing/zones/${selectedZone}/catch-all`)
      .then(r => setCatchAll(r.data))
      .catch(() => setCatchAll(null))
      .finally(() => setLoadingCatchAll(false))
  }, [selectedAccount, selectedZone])

  const handleToggle = async (enable: boolean) => {
    if (!selectedAccount || !selectedZone) return
    const msg = enable ? t.emailRouting.enableConfirm : t.emailRouting.disableConfirm
    if (!confirm(msg)) return
    try {
      const endpoint = enable ? 'enable' : 'disable'
      const r = await api.post(`/cf/${selectedAccount}/email-routing/zones/${selectedZone}/${endpoint}`)
      setSettings(r.data)
    } catch (e: unknown) {
      setError((e as { response?: { data?: { error?: string } } })?.response?.data?.error || t.common.failed)
    }
  }

  const handleCreateRule = async (e: FormEvent) => {
    e.preventDefault()
    if (!selectedAccount || !selectedZone) return
    setCreatingRule(true)
    try {
      await api.post(`/cf/${selectedAccount}/email-routing/zones/${selectedZone}/rules`, {
        name: ruleForm.name,
        priority: ruleForm.priority,
        enabled: true,
        matchers: [{ type: 'literal', field: 'to', value: ruleForm.matchValue }],
        actions: [{ type: 'forward', value: [ruleForm.forwardTo] }],
      })
      setShowAddRule(false)
      setRuleForm({ name: '', priority: 0, matchValue: '', forwardTo: '' })
      const r = await api.get(`/cf/${selectedAccount}/email-routing/zones/${selectedZone}/rules`)
      setRules(r.data || [])
    } catch (e: unknown) {
      setError((e as { response?: { data?: { error?: string } } })?.response?.data?.error || t.common.failed)
    } finally {
      setCreatingRule(false)
    }
  }

  const handleDeleteRule = async (ruleId: string) => {
    if (!selectedAccount || !selectedZone || !confirm(t.emailRouting.deleteRuleConfirm)) return
    try {
      await api.delete(`/cf/${selectedAccount}/email-routing/zones/${selectedZone}/rules/${ruleId}`)
      setRules(prev => prev.filter(r => r.id !== ruleId))
    } catch { /* ignore */ }
  }

  const handleCreateAddr = async (e: FormEvent) => {
    e.preventDefault()
    if (!selectedAccount) return
    setCreatingAddr(true)
    try {
      await api.post(`/cf/${selectedAccount}/email-routing/addresses`, { email: addrEmail })
      setShowAddAddr(false)
      setAddrEmail('')
      const r = await api.get(`/cf/${selectedAccount}/email-routing/addresses`)
      setAddresses(r.data || [])
    } catch (e: unknown) {
      setError((e as { response?: { data?: { error?: string } } })?.response?.data?.error || t.common.failed)
    } finally {
      setCreatingAddr(false)
    }
  }

  const handleDeleteAddr = async (addrId: string) => {
    if (!selectedAccount || !confirm(t.emailRouting.deleteAddressConfirm)) return
    try {
      await api.delete(`/cf/${selectedAccount}/email-routing/addresses/${addrId}`)
      setAddresses(prev => prev.filter(a => a.id !== addrId))
    } catch { /* ignore */ }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
      <div className="mb-8 md:mb-12">
        <h1 className="font-black text-4xl md:text-6xl tracking-tighter">
          {t.emailRouting.title}<span className="text-[#ff006e]">{t.emailRouting.titleHighlight}</span>
        </h1>
        <p className="font-mono text-sm mt-2 text-black">{t.emailRouting.subtitle}</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-8">
        <select
          value={selectedAccount ?? ''}
          onChange={e => { setSelectedAccount(e.target.value ? Number(e.target.value) : null); setSelectedZone(null) }}
          className="border-2 md:border-4 border-black bg-white font-bold px-4 py-2 md:py-3 text-sm focus:outline-none focus:bg-[#ffbe0b] transition-colors"
        >
          <option value="">{t.emailRouting.selectAccount}</option>
          {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>

        {selectedAccount && (
          <select
            value={selectedZone ?? ''}
            onChange={e => setSelectedZone(e.target.value || null)}
            className="border-2 md:border-4 border-black bg-white font-bold px-4 py-2 md:py-3 text-sm focus:outline-none focus:bg-[#ffbe0b] transition-colors"
          >
            <option value="">{t.emailRouting.selectZone}</option>
            {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
          </select>
        )}
      </div>

      {error && <div className="border-2 border-[#ff006e] bg-[#ff006e] text-white font-bold p-3 mb-4 text-sm font-mono">{error}</div>}

      {/* Destination Addresses — account-level, always shown when account selected */}
      {selectedAccount && (
        <div className="border-2 md:border-4 border-black mb-8">
          <div className="p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b-2 md:border-b-4 border-black bg-[#e9ecef]">
            <h2 className="font-black text-lg">{t.emailRouting.addressesTitle}</h2>
            <button
              onClick={() => { setShowAddAddr(!showAddAddr); setError('') }}
              className="font-bold uppercase tracking-widest text-xs bg-[#06d6a0] text-black px-4 py-2 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
            >
              {showAddAddr ? t.common.cancel : t.emailRouting.addAddress}
            </button>
          </div>
          {showAddAddr && (
            <div className="p-4 md:p-6 border-b-2 border-black bg-[#f8f9fa]">
              <form onSubmit={handleCreateAddr} className="flex flex-col md:flex-row gap-3">
                <input
                  value={addrEmail}
                  onChange={e => setAddrEmail(e.target.value)}
                  placeholder={t.emailRouting.emailPlaceholder}
                  type="email"
                  className="border-2 md:border-4 border-black bg-white font-medium px-3 py-2 md:px-4 md:py-3 text-sm focus:outline-none focus:bg-[#ffbe0b] transition-colors flex-1"
                  required
                />
                <button
                  type="submit"
                  disabled={creatingAddr}
                  className="font-bold uppercase tracking-widest bg-[#3a86ff] text-white px-6 py-2 md:py-3 border-2 md:border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] text-sm disabled:opacity-80 transition-all"
                >
                  {creatingAddr ? t.emailRouting.creating : t.common.create}
                </button>
              </form>
            </div>
          )}
          <div className="p-4 md:p-6">
            {loadingAddresses ? (
              <p className="font-mono text-xs">{t.emailRouting.loadingAddresses}</p>
            ) : addresses.length === 0 ? (
              <p className="font-mono text-xs">{t.emailRouting.noAddresses}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-mono">
                  <thead>
                    <tr className="border-b-2 border-black">
                      <th className="text-left font-black py-2 pr-3">EMAIL</th>
                      <th className="text-left font-black py-2 pr-3">{t.common.status}</th>
                      <th className="text-left font-black py-2 pr-3">{t.common.actions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {addresses.map(a => (
                      <tr key={a.id} className="border-b border-gray-300">
                        <td className="py-2 pr-3 font-medium">{a.email}</td>
                        <td className="py-2 pr-3">
                          <span className={`px-2 py-0.5 border font-bold text-[10px] ${
                            a.verified ? 'border-[#06d6a0] bg-[#06d6a0] text-black' : 'border-[#ffbe0b] bg-[#ffbe0b] text-black'
                          }`}>
                            {a.verified ? t.emailRouting.verified : t.emailRouting.unverified}
                          </span>
                        </td>
                        <td className="py-2">
                          <button
                            onClick={() => handleDeleteAddr(a.id)}
                            className="font-bold uppercase text-[10px] bg-[#ff006e] text-white px-2 py-1 border border-black hover:bg-[#d1004e] transition-colors"
                          >
                            {t.emailRouting.deleteAddress}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Zone-level: settings, rules, catch-all */}
      {!selectedAccount ? (
        <div className="border-2 md:border-4 border-black p-8 md:p-12 text-center">
          <p className="font-black text-xl mb-2">{t.emailRouting.noAccountSelected}</p>
          <p className="font-mono text-sm">{t.emailRouting.noAccountSelectedDesc}</p>
        </div>
      ) : !selectedZone ? (
        <div className="border-2 md:border-4 border-black p-8 md:p-12 text-center">
          <p className="font-black text-xl mb-2">{t.emailRouting.noZoneSelected}</p>
          <p className="font-mono text-sm">{t.emailRouting.noZoneSelectedDesc}</p>
        </div>
      ) : (
        <>
          {/* Settings */}
          <div className="border-2 md:border-4 border-black mb-8">
            <div className="p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h2 className="font-black text-lg">{t.emailRouting.settingsTitle}</h2>
                {loadingSettings ? (
                  <p className="font-mono text-xs mt-1">{t.emailRouting.loadingSettings}</p>
                ) : settings && (
                  <span className={`inline-block mt-2 px-3 py-1 border-2 font-bold text-xs ${
                    settings.enabled
                      ? 'border-[#06d6a0] bg-[#06d6a0] text-black'
                      : 'border-[#ff006e] bg-[#ff006e] text-white'
                  }`}>
                    {settings.enabled ? t.emailRouting.enabled : t.emailRouting.disabled}
                  </span>
                )}
              </div>
              {settings && (
                <button
                  onClick={() => handleToggle(!settings.enabled)}
                  className={`font-bold uppercase tracking-widest text-xs px-4 py-2 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all ${
                    settings.enabled ? 'bg-[#ff006e] text-white' : 'bg-[#06d6a0] text-black'
                  }`}
                >
                  {settings.enabled ? t.emailRouting.disable : t.emailRouting.enable}
                </button>
              )}
            </div>
          </div>

          {/* Rules */}
          <div className="border-2 md:border-4 border-black mb-8">
            <div className="p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b-2 md:border-b-4 border-black bg-[#e9ecef]">
              <h2 className="font-black text-lg">{t.emailRouting.rulesTitle}</h2>
              <button
                onClick={() => { setShowAddRule(!showAddRule); setError('') }}
                className="font-bold uppercase tracking-widest text-xs bg-[#06d6a0] text-black px-4 py-2 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
              >
                {showAddRule ? t.common.cancel : t.emailRouting.addRule}
              </button>
            </div>

            {showAddRule && (
              <div className="p-4 md:p-6 border-b-2 border-black bg-[#f8f9fa]">
                <form onSubmit={handleCreateRule} className="space-y-3">
                  <div className="flex flex-col md:flex-row gap-3">
                    <input
                      value={ruleForm.name}
                      onChange={e => setRuleForm({ ...ruleForm, name: e.target.value })}
                      placeholder={t.emailRouting.ruleNamePlaceholder}
                      className="border-2 md:border-4 border-black bg-white font-medium px-3 py-2 md:px-4 md:py-3 text-sm focus:outline-none focus:bg-[#ffbe0b] transition-colors flex-1"
                      required
                    />
                    <input
                      type="number"
                      value={ruleForm.priority}
                      onChange={e => setRuleForm({ ...ruleForm, priority: Number(e.target.value) })}
                      placeholder={t.emailRouting.priority}
                      className="border-2 md:border-4 border-black bg-white font-medium px-3 py-2 md:px-4 md:py-3 text-sm focus:outline-none focus:bg-[#ffbe0b] transition-colors w-full md:w-28"
                    />
                  </div>
                  <div className="flex flex-col md:flex-row gap-3">
                    <input
                      value={ruleForm.matchValue}
                      onChange={e => setRuleForm({ ...ruleForm, matchValue: e.target.value })}
                      placeholder={t.emailRouting.matcherValue + ' (e.g. info@domain.com)'}
                      className="border-2 md:border-4 border-black bg-white font-medium px-3 py-2 md:px-4 md:py-3 text-sm focus:outline-none focus:bg-[#ffbe0b] transition-colors flex-1"
                      required
                    />
                    <input
                      value={ruleForm.forwardTo}
                      onChange={e => setRuleForm({ ...ruleForm, forwardTo: e.target.value })}
                      placeholder={t.emailRouting.actionValuePlaceholder}
                      type="email"
                      className="border-2 md:border-4 border-black bg-white font-medium px-3 py-2 md:px-4 md:py-3 text-sm focus:outline-none focus:bg-[#ffbe0b] transition-colors flex-1"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={creatingRule}
                    className="font-bold uppercase tracking-widest bg-[#3a86ff] text-white px-6 py-2 md:py-3 border-2 md:border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] text-sm disabled:opacity-80 transition-all"
                  >
                    {creatingRule ? t.emailRouting.creating : t.common.create}
                  </button>
                </form>
              </div>
            )}

            <div className="p-4 md:p-6">
              {loadingRules ? (
                <p className="font-mono text-xs">{t.emailRouting.loadingRules}</p>
              ) : rules.length === 0 ? (
                <p className="font-mono text-xs">{t.emailRouting.noRules}</p>
              ) : (
                <div className="space-y-3">
                  {rules.map(r => (
                    <div key={r.id} className="border-2 border-black p-3 md:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-black text-sm">{r.name || r.id.slice(0, 8)}</span>
                          <span className={`px-2 py-0.5 border font-bold text-[10px] ${
                            r.enabled ? 'border-[#06d6a0] bg-[#06d6a0] text-black' : 'border-gray-400 bg-gray-200 text-gray-600'
                          }`}>
                            {r.enabled ? t.emailRouting.enabled : t.emailRouting.disabled}
                          </span>
                          <span className="font-mono text-[10px] text-gray-500">P{r.priority}</span>
                        </div>
                        <div className="font-mono text-xs mt-1 space-y-0.5">
                          {r.matchers.map((m, i) => (
                            <p key={i}><span className="font-bold">{m.field}:</span> {m.value}</p>
                          ))}
                          {r.actions.map((a, i) => (
                            <p key={i}><span className="font-bold">{a.type}:</span> {a.value?.join(', ')}</p>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteRule(r.id)}
                        className="font-bold uppercase tracking-widest text-[10px] bg-[#ff006e] text-white px-2 py-1 border border-black hover:bg-[#d1004e] transition-colors flex-shrink-0"
                      >
                        {t.emailRouting.deleteRule}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Catch-All */}
          <div className="border-2 md:border-4 border-black">
            <div className="p-4 md:p-6 border-b-2 md:border-b-4 border-black bg-[#e9ecef]">
              <h2 className="font-black text-lg">{t.emailRouting.catchAllTitle}</h2>
            </div>
            <div className="p-4 md:p-6">
              {loadingCatchAll ? (
                <p className="font-mono text-xs">{t.emailRouting.loadingCatchAll}</p>
              ) : !catchAll ? (
                <p className="font-mono text-xs">{t.common.noData}</p>
              ) : (
                <div className="space-y-2">
                  <span className={`inline-block px-3 py-1 border-2 font-bold text-xs ${
                    catchAll.enabled
                      ? 'border-[#06d6a0] bg-[#06d6a0] text-black'
                      : 'border-gray-400 bg-gray-200 text-gray-600'
                  }`}>
                    {catchAll.enabled ? t.emailRouting.enabled : t.emailRouting.disabled}
                  </span>
                  {catchAll.actions?.map((a, i) => (
                    <p key={i} className="font-mono text-xs">
                      <span className="font-bold">{a.type}:</span> {a.value?.join(', ') || '-'}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
