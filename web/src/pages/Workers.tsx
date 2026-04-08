import { useEffect, useState, type FormEvent } from 'react'
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

  const [codeModal, setCodeModal] = useState<{ name: string; code: string } | null>(null)
  const [loadingCode, setLoadingCode] = useState(false)

  const [showDeploy, setShowDeploy] = useState(false)
  const [deployForm, setDeployForm] = useState({ script_name: '', content: '', module: true })
  const [deploying, setDeploying] = useState(false)
  const [deployError, setDeployError] = useState('')

  useEffect(() => {
    api.get('/accounts').then((res) => {
      const accts = res.data || []
      setAccounts(accts)
      if (accts.length > 0) setSelectedAccount(accts[0].id)
    })
  }, [])

  const loadWorkers = () => {
    if (!selectedAccount) return
    setLoading(true)
    api.get(`/cf/${selectedAccount}/workers`)
      .then((res) => setWorkers(res.data || []))
      .catch(() => setWorkers([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadWorkers() }, [selectedAccount])

  const handleViewCode = async (scriptName: string) => {
    if (!selectedAccount) return
    setLoadingCode(true)
    try {
      const res = await api.get(`/cf/${selectedAccount}/workers/${scriptName}`)
      setCodeModal({ name: scriptName, code: res.data.code || '' })
    } catch {
      setCodeModal({ name: scriptName, code: '(Failed to load code)' })
    } finally {
      setLoadingCode(false)
    }
  }

  const handleDelete = async (scriptName: string) => {
    if (!selectedAccount || !confirm(t.workers.deleteConfirm)) return
    try {
      await api.delete(`/cf/${selectedAccount}/workers/${scriptName}`)
      loadWorkers()
    } catch { /* ignore */ }
  }

  const handleDeploy = async (e: FormEvent) => {
    e.preventDefault()
    if (!selectedAccount) return
    setDeploying(true)
    setDeployError('')
    try {
      await api.post(`/cf/${selectedAccount}/workers`, deployForm)
      setShowDeploy(false)
      setDeployForm({ script_name: '', content: '', module: true })
      loadWorkers()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || t.common.failed
      setDeployError(msg)
    } finally {
      setDeploying(false)
    }
  }

  return (
    <div className="py-8 md:py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="font-black text-3xl md:text-5xl tracking-tight mb-2">
              {t.workers.title}<span className="text-[#ffbe0b]">{t.workers.titleHighlight}</span>
            </h1>
            <p className="font-mono text-sm md:text-base">{t.workers.subtitle}</p>
          </div>
          {selectedAccount && (
            <button
              onClick={() => setShowDeploy(!showDeploy)}
              className="self-start sm:self-auto font-bold uppercase tracking-widest transition-all duration-200 bg-black text-white px-4 py-2 md:px-6 md:py-3 border-2 md:border-4 border-black shadow-[4px_4px_0px_0px_rgba(255,190,11,1)] md:shadow-[8px_8px_0px_0px_rgba(255,190,11,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] text-xs md:text-sm"
            >
              {showDeploy ? t.common.cancel : t.workers.deploy}
            </button>
          )}
        </div>

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

        {showDeploy && (
          <div className="border-2 md:border-4 border-black bg-white p-4 md:p-8 mb-8">
            <h2 className="font-black text-xl md:text-2xl mb-4 md:mb-6">{t.workers.deployTitle}</h2>
            {deployError && (
              <div className="border-2 border-[#ff006e] bg-[#ff006e] text-white font-bold p-3 mb-4 text-sm font-mono">{deployError}</div>
            )}
            <form onSubmit={handleDeploy} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-black uppercase tracking-widest text-xs mb-1 block">{t.workers.scriptName}</label>
                  <input
                    value={deployForm.script_name}
                    onChange={(e) => setDeployForm({ ...deployForm, script_name: e.target.value })}
                    className="w-full border-2 md:border-4 border-black bg-white font-medium focus:outline-none focus:bg-[#ffbe0b] transition-colors duration-200 px-3 py-2 md:px-4 md:py-3 text-sm font-mono"
                    placeholder="my-worker"
                    required
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 font-mono text-sm">
                    <input
                      type="checkbox"
                      checked={deployForm.module}
                      onChange={(e) => setDeployForm({ ...deployForm, module: e.target.checked })}
                      className="w-5 h-5 border-2 border-black accent-[#ffbe0b]"
                    />
                    {t.workers.moduleFormat}
                  </label>
                </div>
              </div>
              <div>
                <label className="font-black uppercase tracking-widest text-xs mb-1 block">{t.workers.content}</label>
                <textarea
                  value={deployForm.content}
                  onChange={(e) => setDeployForm({ ...deployForm, content: e.target.value })}
                  className="w-full border-2 md:border-4 border-black bg-white font-mono text-sm focus:outline-none focus:bg-[#ffbe0b] transition-colors duration-200 px-3 py-2 md:px-4 md:py-3 min-h-[200px] resize-y"
                  placeholder={'export default {\n  async fetch(request) {\n    return new Response("Hello World");\n  }\n};'}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={deploying}
                className="font-bold uppercase tracking-widest transition-all duration-200 bg-[#ffbe0b] text-black px-6 py-3 border-2 md:border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] text-sm disabled:opacity-80"
              >
                {deploying ? t.workers.deploying : t.workers.deploy}
              </button>
            </form>
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
                <div className="font-mono text-xs space-y-1 mb-4">
                  <p>{t.workers.size}: <span className="font-bold">{(w.size / 1024).toFixed(1)}KB</span></p>
                  <p>{t.workers.created}: {w.created_on?.slice(0, 10)}</p>
                  <p>{t.workers.modified}: {w.modified_on?.slice(0, 10)}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewCode(w.id)}
                    disabled={loadingCode}
                    className="font-bold uppercase tracking-widest transition-colors duration-200 bg-white text-black px-3 py-1.5 border-2 border-black text-xs hover:bg-[#ffbe0b]"
                  >
                    {t.workers.viewCode}
                  </button>
                  <button
                    onClick={() => handleDelete(w.id)}
                    className="font-bold uppercase tracking-widest transition-colors duration-200 bg-white text-black px-3 py-1.5 border-2 border-black text-xs hover:bg-[#ff006e] hover:text-white"
                  >
                    {t.workers.deleteWorker}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {codeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={() => setCodeModal(null)}>
          <div className="bg-white border-2 md:border-4 border-black p-6 md:p-8 w-full max-w-3xl max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-black text-xl">{codeModal.name} — {t.workers.code}</h2>
              <button
                onClick={() => setCodeModal(null)}
                className="font-bold uppercase tracking-widest transition-colors duration-200 bg-white text-black px-3 py-1.5 border-2 border-black text-xs hover:bg-black hover:text-white"
              >
                {t.common.close}
              </button>
            </div>
            <pre className="flex-1 overflow-auto border-2 border-black bg-black text-[#06d6a0] p-4 font-mono text-sm whitespace-pre-wrap">
              {codeModal.code}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
