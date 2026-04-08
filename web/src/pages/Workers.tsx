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
  const [error, setError] = useState('')

  const [codeModal, setCodeModal] = useState<{ name: string; code: string } | null>(null)
  const [loadingCode, setLoadingCode] = useState(false)

  const [showDeploy, setShowDeploy] = useState(false)
  const [deployForm, setDeployForm] = useState({ script_name: '', content: '', module: true })
  const [deploying, setDeploying] = useState(false)
  const [deployError, setDeployError] = useState('')

  useEffect(() => {
    api.get('/accounts').then((res) => {
      setAccounts(res.data || [])
    })
  }, [])

  useEffect(() => {
    if (!selectedAccount) { setWorkers([]); return }
    setLoading(true)
    setError('')
    api.get(`/cf/${selectedAccount}/workers`)
      .then((res) => setWorkers(res.data || []))
      .catch((e) => { setWorkers([]); setError(e.response?.data?.error || t.common.failed) })
      .finally(() => setLoading(false))
  }, [selectedAccount])

  const loadWorkers = () => {
    if (!selectedAccount) return
    api.get(`/cf/${selectedAccount}/workers`)
      .then((res) => setWorkers(res.data || []))
      .catch(() => setWorkers([]))
  }

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

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
      <div className="mb-8 md:mb-12">
        <h1 className="font-black text-4xl md:text-6xl tracking-tighter">
          {t.workers.title}<span className="text-[#ffbe0b]">{t.workers.titleHighlight}</span>
        </h1>
        <p className="font-mono text-sm mt-2 text-black">{t.workers.subtitle}</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-8">
        <select
          value={selectedAccount ?? ''}
          onChange={(e) => setSelectedAccount(e.target.value ? Number(e.target.value) : null)}
          className="border-2 md:border-4 border-black bg-white font-bold px-4 py-2 md:py-3 text-sm focus:outline-none focus:bg-[#ffbe0b] transition-colors"
        >
          <option value="">{t.workers.selectAccount}</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>

        {selectedAccount && (
          <button
            onClick={() => { setShowDeploy(!showDeploy); setDeployError('') }}
            className="font-bold uppercase tracking-widest transition-all duration-200 bg-[#ffbe0b] text-black px-6 py-2 md:py-3 border-2 md:border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] text-sm"
          >
            {showDeploy ? t.common.cancel : t.workers.deploy}
          </button>
        )}
      </div>

      {showDeploy && (
        <div className="border-2 md:border-4 border-black p-4 md:p-6 mb-8 bg-[#e9ecef]">
          <h3 className="font-black text-lg mb-4">{t.workers.deployTitle}</h3>
          {deployError && (
            <div className="border-2 border-[#ff006e] bg-[#ff006e] text-white font-bold p-3 mb-4 text-sm font-mono">{deployError}</div>
          )}
          <form onSubmit={handleDeploy} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
              <input
                value={deployForm.script_name}
                onChange={(e) => setDeployForm({ ...deployForm, script_name: e.target.value })}
                placeholder="my-worker"
                className="border-2 md:border-4 border-black bg-white font-medium px-3 py-2 md:px-4 md:py-3 text-sm focus:outline-none focus:bg-[#ffbe0b] transition-colors flex-1 font-mono"
                required
              />
              <label className="flex items-center gap-2 font-mono text-sm px-3 py-2 border-2 md:border-4 border-black bg-white">
                <input
                  type="checkbox"
                  checked={deployForm.module}
                  onChange={(e) => setDeployForm({ ...deployForm, module: e.target.checked })}
                  className="w-4 h-4 accent-[#ffbe0b]"
                />
                {t.workers.moduleFormat}
              </label>
            </div>
            <textarea
              value={deployForm.content}
              onChange={(e) => setDeployForm({ ...deployForm, content: e.target.value })}
              placeholder={'export default {\n  async fetch(request) {\n    return new Response("Hello World");\n  }\n};'}
              className="w-full border-2 md:border-4 border-black bg-white font-mono text-sm focus:outline-none focus:bg-[#ffbe0b] transition-colors px-3 py-2 md:px-4 md:py-3 min-h-[200px] resize-y"
              required
            />
            <button
              type="submit"
              disabled={deploying}
              className="font-bold uppercase tracking-widest bg-[#3a86ff] text-white px-6 py-2 md:py-3 border-2 md:border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] text-sm disabled:opacity-80 transition-all"
            >
              {deploying ? t.workers.deploying : t.workers.deploy}
            </button>
          </form>
        </div>
      )}

      {error && <div className="border-2 border-[#ff006e] bg-[#ff006e] text-white font-bold p-3 mb-4 text-sm font-mono">{error}</div>}

      {loading ? (
        <p className="font-mono text-sm">{t.workers.loadingWorkers}</p>
      ) : !selectedAccount ? (
        <div className="border-2 md:border-4 border-black p-8 md:p-12 text-center">
          <p className="font-black text-xl mb-2">{t.workers.noWorkers}</p>
          <p className="font-mono text-sm">{t.workers.noWorkersDescNoAccount}</p>
        </div>
      ) : workers.length === 0 ? (
        <div className="border-2 md:border-4 border-black p-8 md:p-12 text-center">
          <p className="font-black text-xl mb-2">{t.workers.noWorkers}</p>
          <p className="font-mono text-sm">{t.workers.noWorkersDesc}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {workers.map((w) => (
            <div key={w.id} className="border-2 md:border-4 border-black">
              <div className="p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-lg md:text-xl truncate">{w.id}</h3>
                  <div className="font-mono text-xs mt-1 flex flex-wrap gap-x-4 gap-y-0.5">
                    <p>
                      <span className="font-bold">{t.workers.size}:</span>{' '}
                      <span className="bg-[#e9ecef] px-1.5 py-0.5 border border-black">{formatSize(w.size)}</span>
                    </p>
                    <p><span className="font-bold">{t.workers.created}:</span> {w.created_on ? new Date(w.created_on).toLocaleDateString() : '-'}</p>
                    <p><span className="font-bold">{t.workers.modified}:</span> {w.modified_on ? new Date(w.modified_on).toLocaleDateString() : '-'}</p>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleViewCode(w.id)}
                    disabled={loadingCode}
                    className="font-bold uppercase tracking-widest text-xs bg-[#3a86ff] text-white px-3 py-2 border-2 border-black hover:bg-[#2563eb] transition-colors disabled:opacity-60"
                  >
                    {t.workers.viewCode}
                  </button>
                  <button
                    onClick={() => handleDelete(w.id)}
                    className="font-bold uppercase tracking-widest text-xs bg-[#ff006e] text-white px-3 py-2 border-2 border-black hover:bg-[#d1004e] transition-colors"
                  >
                    {t.workers.deleteWorker}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {codeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={() => setCodeModal(null)}>
          <div className="bg-white border-2 md:border-4 border-black w-full max-w-4xl max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 md:p-6 border-b-2 md:border-b-4 border-black">
              <h2 className="font-black text-lg md:text-xl truncate pr-4">{codeModal.name}</h2>
              <button
                onClick={() => setCodeModal(null)}
                className="font-bold uppercase tracking-widest transition-colors duration-200 bg-white text-black px-3 py-1.5 border-2 border-black text-xs hover:bg-black hover:text-white flex-shrink-0"
              >
                {t.common.close}
              </button>
            </div>
            <pre className="flex-1 overflow-auto bg-[#1a1a2e] text-[#06d6a0] p-4 md:p-6 font-mono text-sm leading-relaxed whitespace-pre-wrap">
              {codeModal.code}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
