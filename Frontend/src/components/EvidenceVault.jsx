import React, { useState } from 'react'
import { Upload, FileText, Image as ImageIcon, File, Check, Copy, ShieldCheck, ExternalLink } from 'lucide-react'
import api from '../services/api'

export default function EvidenceVault({ complaintId, evidenceList = [], onUploaded }) {
  const [uploading, setUploading] = useState(false)
  const [copiedHash, setCopiedHash] = useState('')
  const [uploadError, setUploadError] = useState('')

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setUploadError('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      await api.post(`/complaints/${complaintId}/evidence`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      if (onUploaded) onUploaded()
    } catch (err) {
      setUploadError(err.response?.data?.detail || 'Failed to upload evidence file.')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const copyHash = (hash) => {
    navigator.clipboard.writeText(hash)
    setCopiedHash(hash)
    setTimeout(() => setCopiedHash(''), 2000)
  }

  const formatSize = (bytes) => {
    if (!bytes) return '0 B'
    const kb = bytes / 1024
    if (kb < 1024) return `${kb.toFixed(1)} KB`
    return `${(kb / 1024).toFixed(2)} MB`
  }

  const getFileIcon = (type) => {
    const t = (type || '').toLowerCase()
    if (['jpg', 'jpeg', 'png', 'image'].includes(t)) {
      return <ImageIcon className="w-5 h-5 text-indigo-500" />
    }
    if (t === 'pdf') {
      return <FileText className="w-5 h-5 text-red-500" />
    }
    return <File className="w-5 h-5 text-slate-500" />
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            Forensic Evidence Vault
          </h3>
          <p className="text-xs text-slate-500">Cryptographically hashed evidence records attached to this complaint</p>
        </div>

        {/* Upload Button */}
        <label className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-sm cursor-pointer transition-all ${
          uploading 
            ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
            : 'bg-indigo-600 hover:bg-indigo-700 text-white active:scale-95'
        }`}>
          <Upload className="w-3.5 h-3.5" />
          <span>{uploading ? 'Processing File...' : 'Upload Evidence File'}</span>
          <input 
            type="file" 
            className="hidden" 
            accept=".jpg,.jpeg,.png,.pdf,.txt"
            disabled={uploading}
            onChange={handleFileUpload}
          />
        </label>
      </div>

      {uploadError && (
        <div className="text-xs bg-red-50 text-red-700 border border-red-200 p-2.5 rounded-xl">
          {uploadError}
        </div>
      )}

      {/* File List */}
      {evidenceList.length === 0 ? (
        <div className="py-8 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl space-y-1">
          <Upload className="w-8 h-8 mx-auto text-slate-300" />
          <p className="text-xs font-medium text-slate-500">No evidence attached yet</p>
          <p className="text-[11px] text-slate-400">Supported formats: JPG, PNG, PDF, TXT</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {evidenceList.map((item, idx) => (
            <div 
              key={item.id || idx}
              className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 hover:shadow-md transition-all space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-xs">
                    {getFileIcon(item.file_type)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate" title={item.filename}>
                      {item.filename}
                    </p>
                    <p className="text-[11px] text-slate-500 flex items-center gap-2">
                      <span>{item.file_type?.toUpperCase()}</span>
                      <span>•</span>
                      <span>{formatSize(item.file_size)}</span>
                      {item.width && item.height && (
                        <>
                          <span>•</span>
                          <span>{item.width}×{item.height}px</span>
                        </>
                      )}
                      {item.pages && (
                        <>
                          <span>•</span>
                          <span>{item.pages} {item.pages === 1 ? 'page' : 'pages'}</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>

                {item.stored_path && (
                  <a 
                    href={`http://localhost:8000/uploads/${complaintId}_${item.filename}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100"
                    title="View File"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              {/* SHA-256 Hash Display */}
              <div className="bg-white border border-slate-200 rounded-lg p-2 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-[9px] font-mono uppercase text-slate-400 tracking-wider">SHA-256 Checksum</div>
                  <div className="text-[10px] font-mono text-slate-600 truncate" title={item.sha256}>
                    {item.sha256}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => copyHash(item.sha256)}
                  className="shrink-0 p-1 text-slate-400 hover:text-indigo-600 rounded hover:bg-slate-50 transition-colors"
                  title="Copy SHA-256 Hash"
                >
                  {copiedHash === item.sha256 ? (
                    <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                      <Check className="w-3 h-3" /> Copied
                    </span>
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
