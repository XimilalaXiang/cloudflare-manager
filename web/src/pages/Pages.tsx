import { useState, useEffect, type FormEvent } from 'react'
import api from '../lib/api'
import { useI18n } from '../i18n'

interface Account { id: number; name: string; status: string }
interface PagesProject {
  name: string; id: string; subdomain: string; domains: string[]
  production_branch: string; created_on: string
}
interface Deployment {
  id: string; short_id: string; project_name: string; environment: string
  url: string; latest_stage: string; created_on: string
}

export default function Pages() {
  const { t } = useI18n()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [selectedAccount, setSelectedAccount] = useState<number | null>(null)
  const [projects, setProjects] = useState<PagesProject[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [showCreate, setShowCreate] = useState(false)
  const [createForm, setCreateForm] = useState({ name: '', production_branch: 'main' })
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')

  const [expandedProject, setExpandedProject] = useState<string | null>(null)
  const [deployments, setDeployments] = useState<Deployment[]>([])
  const [loadingDeployments, setLoadingDeployments] = useState(false)

  useEffect(() => {
    api.get('/accounts').then(r => setAccounts(r.data || []))
  }, [])

  useEffect(() => {
    if (!selectedAccount) { setProjects([]); return }
    setLoading(true)
    setError('')
    api.get(`/cf/${selectedAccount}/pages/projects`)
      .then(r => setProjects(r.data || []))
      .catch(e => setError(e.response?.data?.error || t.common.failed))
      .finally(() => setLoading(false))
  }, [selectedAccount])

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault()
    if (!selectedAccount) return
    setCreating(true)
    setCreateError('')
    try {
      await api.post(`/cf/${selectedAccount}/pages/projects`, createForm)
      setShowCreate(false)
      setCreateForm({ name: '', production_branch: 'main' })
      const r = await api.get(`/cf/${selectedAccount}/pages/projects`)
      setProjects(r.data || [])
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error || t.common.failed
      setCreateError(msg)
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (name: string) => {
    if (!selectedAccount || !confirm(t.pages.deleteConfirm)) return
    try {
      await api.delete(`/cf/${selectedAccount}/pages/projects/${name}`)
      setProjects(prev => prev.filter(p => p.name !== name))
    } catch { /* ignore */ }
  }

  const toggleDeployments = async (projectName: string) => {
    if (expandedProject === projectName) {
      setExpandedProject(null)
      setDeployments([])
      return
    }
    if (!selectedAccount) return
    setExpandedProject(projectName)
    setLoadingDeployments(true)
    try {
      const r = await api.get(`/cf/${selectedAccount}/pages/projects/${projectName}/deployments`)
      setDeployments(r.data || [])
    } catch { setDeployments([]) }
    finally { setLoadingDeployments(false) }
  }

  const handleDeleteDeployment = async (projectName: string, deploymentId: string) => {
    if (!selectedAccount || !confirm(t.pages.deleteDeploymentConfirm)) return
    try {
      await api.delete(`/cf/${selectedAccount}/pages/projects/${projectName}/deployments/${deploymentId}`)
      setDeployments(prev => prev.filter(d => d.id !== deploymentId))
    } catch { /* ignore */ }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
      <div className="mb-8 md:mb-12">
        <h1 className="font-black text-4xl md:text-6xl tracking-tighter">
          {t.pages.title}<span className="text-[#ff006e]">{t.pages.titleHighlight}</span>
        </h1>
        <p className="font-mono text-sm mt-2 text-black">{t.pages.subtitle}</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-8">
        <select
          value={selectedAccount ?? ''}
          onChange={e => { setSelectedAccount(e.target.value ? Number(e.target.value) : null); setExpandedProject(null) }}
          className="border-2 md:border-4 border-black bg-white font-bold px-4 py-2 md:py-3 text-sm focus:outline-none focus:bg-[#ffbe0b] transition-colors"
        >
          <option value="">{t.pages.selectAccount}</option>
          {accounts.map(a => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>

        {selectedAccount && (
          <button
            onClick={() => { setShowCreate(!showCreate); setCreateError('') }}
            className="font-bold uppercase tracking-widest transition-all duration-200 bg-[#06d6a0] text-black px-6 py-2 md:py-3 border-2 md:border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] text-sm"
          >
            {showCreate ? t.common.cancel : t.pages.createProject}
          </button>
        )}
      </div>

      {showCreate && (
        <div className="border-2 md:border-4 border-black p-4 md:p-6 mb-8 bg-[#e9ecef]">
          <h3 className="font-black text-lg mb-4">{t.pages.createProject}</h3>
          {createError && <div className="border-2 border-[#ff006e] bg-[#ff006e] text-white font-bold p-3 mb-4 text-sm font-mono">{createError}</div>}
          <form onSubmit={handleCreate} className="flex flex-col md:flex-row gap-3">
            <input
              value={createForm.name}
              onChange={e => setCreateForm({ ...createForm, name: e.target.value })}
              placeholder={t.pages.projectName}
              className="border-2 md:border-4 border-black bg-white font-medium px-3 py-2 md:px-4 md:py-3 text-sm focus:outline-none focus:bg-[#ffbe0b] transition-colors flex-1"
              required
            />
            <input
              value={createForm.production_branch}
              onChange={e => setCreateForm({ ...createForm, production_branch: e.target.value })}
              placeholder={t.pages.branchPlaceholder}
              className="border-2 md:border-4 border-black bg-white font-medium px-3 py-2 md:px-4 md:py-3 text-sm focus:outline-none focus:bg-[#ffbe0b] transition-colors w-full md:w-48"
            />
            <button
              type="submit"
              disabled={creating}
              className="font-bold uppercase tracking-widest bg-[#3a86ff] text-white px-6 py-2 md:py-3 border-2 md:border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] text-sm disabled:opacity-80 transition-all"
            >
              {creating ? t.pages.creating : t.common.create}
            </button>
          </form>
        </div>
      )}

      {error && <div className="border-2 border-[#ff006e] bg-[#ff006e] text-white font-bold p-3 mb-4 text-sm font-mono">{error}</div>}

      {loading ? (
        <p className="font-mono text-sm">{t.pages.loadingProjects}</p>
      ) : !selectedAccount ? (
        <div className="border-2 md:border-4 border-black p-8 md:p-12 text-center">
          <p className="font-black text-xl mb-2">{t.pages.noProjects}</p>
          <p className="font-mono text-sm">{t.pages.noProjectsDescNoAccount}</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="border-2 md:border-4 border-black p-8 md:p-12 text-center">
          <p className="font-black text-xl mb-2">{t.pages.noProjects}</p>
          <p className="font-mono text-sm">{t.pages.noProjectsDesc}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map(p => (
            <div key={p.name} className="border-2 md:border-4 border-black">
              <div className="p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-lg md:text-xl">{p.name}</h3>
                  <div className="font-mono text-xs mt-1 space-y-0.5">
                    <p><span className="font-bold">{t.pages.subdomain}:</span> {p.subdomain}.pages.dev</p>
                    {p.domains && p.domains.length > 0 && (
                      <p><span className="font-bold">{t.pages.domains}:</span> {p.domains.join(', ')}</p>
                    )}
                    <p><span className="font-bold">{t.pages.productionBranch}:</span> {p.production_branch || 'main'}</p>
                    {p.created_on && (
                      <p><span className="font-bold">{t.pages.created}:</span> {new Date(p.created_on).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => toggleDeployments(p.name)}
                    className="font-bold uppercase tracking-widest text-xs bg-[#3a86ff] text-white px-3 py-2 border-2 border-black hover:bg-[#2563eb] transition-colors"
                  >
                    {expandedProject === p.name ? t.pages.hideDeployments : t.pages.viewDeployments}
                  </button>
                  <button
                    onClick={() => handleDelete(p.name)}
                    className="font-bold uppercase tracking-widest text-xs bg-[#ff006e] text-white px-3 py-2 border-2 border-black hover:bg-[#d1004e] transition-colors"
                  >
                    {t.pages.deleteProject}
                  </button>
                </div>
              </div>

              {expandedProject === p.name && (
                <div className="border-t-2 md:border-t-4 border-black p-4 md:p-6 bg-[#f8f9fa]">
                  <h4 className="font-black text-sm mb-3">{t.pages.deployments}</h4>
                  {loadingDeployments ? (
                    <p className="font-mono text-xs">{t.pages.loadingDeployments}</p>
                  ) : deployments.length === 0 ? (
                    <p className="font-mono text-xs">{t.pages.noDeployments}</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs font-mono">
                        <thead>
                          <tr className="border-b-2 border-black">
                            <th className="text-left font-black py-2 pr-3">{t.pages.deploymentId}</th>
                            <th className="text-left font-black py-2 pr-3">{t.pages.environment}</th>
                            <th className="text-left font-black py-2 pr-3">{t.pages.url}</th>
                            <th className="text-left font-black py-2 pr-3">{t.pages.stage}</th>
                            <th className="text-left font-black py-2 pr-3">{t.pages.created}</th>
                            <th className="text-left font-black py-2">{t.common.actions}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {deployments.map(d => (
                            <tr key={d.id} className="border-b border-gray-300">
                              <td className="py-2 pr-3">{d.short_id || d.id.slice(0, 8)}</td>
                              <td className="py-2 pr-3">
                                <span className={`px-2 py-0.5 border font-bold text-[10px] ${
                                  d.environment === 'production'
                                    ? 'border-[#06d6a0] bg-[#06d6a0] text-black'
                                    : 'border-[#ffbe0b] bg-[#ffbe0b] text-black'
                                }`}>
                                  {d.environment}
                                </span>
                              </td>
                              <td className="py-2 pr-3">
                                {d.url ? <a href={d.url} target="_blank" rel="noopener noreferrer" className="text-[#3a86ff] underline">{d.url}</a> : '-'}
                              </td>
                              <td className="py-2 pr-3">{d.latest_stage}</td>
                              <td className="py-2 pr-3">{d.created_on ? new Date(d.created_on).toLocaleDateString() : '-'}</td>
                              <td className="py-2">
                                <button
                                  onClick={() => handleDeleteDeployment(p.name, d.id)}
                                  className="font-bold uppercase text-[10px] bg-[#ff006e] text-white px-2 py-1 border border-black hover:bg-[#d1004e] transition-colors"
                                >
                                  {t.pages.deleteDeployment}
                                </button>
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
          ))}
        </div>
      )}
    </div>
  )
}
