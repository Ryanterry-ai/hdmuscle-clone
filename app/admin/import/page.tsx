'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, ArrowRight, Loader2, FileDown, RefreshCw, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import type { ImportValidationResult } from '@/lib/data/types'

type Step = 'upload' | 'preview' | 'validation' | 'import' | 'done'

export default function AdminImportPage() {
  const [step, setStep] = useState<Step>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [parsedProducts, setParsedProducts] = useState<any[]>([])
  const [validationResults, setValidationResults] = useState<ImportValidationResult | null>(null)
  const [importSummary, setImportSummary] = useState<{ created: number; updated: number; skipped: number } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0])
      setError(null)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv'],
      'application/json': ['.json'],
    },
    maxSize: 50 * 1024 * 1024,
    onDropRejected: () => setError('Invalid file type or size exceeds 50MB'),
  })

  const handleParseFile = async () => {
    if (!file) return
    setLoading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/admin/import?action=parse', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to parse file')
      setParsedProducts(data.products || [])
      setStep('preview')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleValidate = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/import?action=validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: parsedProducts }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Validation failed')
      setValidationResults(data)
      setStep('validation')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleImport = async () => {
    setStep('import')
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/import?action=apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: parsedProducts }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Import failed')
      setImportSummary(data)
      setStep('done')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const resetImport = () => {
    setStep('upload')
    setFile(null)
    setParsedProducts([])
    setValidationResults(null)
    setImportSummary(null)
    setError(null)
  }

  const steps = ['upload', 'preview', 'validation', 'import', 'done']
  const currentStepIndex = steps.indexOf(step)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft size={18} />
            Back to Dashboard
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Product Import</h1>
          <div className="w-32" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Step Indicator */}
        <div className="flex justify-center mb-10">
          <div className="flex items-center">
            {steps.map((s, index) => (
              <div key={s} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-semibold transition-colors ${
                  step === s ? 'bg-[#00ff88] text-gray-900' :
                  currentStepIndex > index ? 'bg-green-600 text-white' :
                  'bg-gray-200 text-gray-500'
                }`}>
                  {currentStepIndex > index ? <CheckCircle size={18} /> : index + 1}
                </div>
                <div className="ml-2 text-sm font-medium text-gray-600 capitalize hidden sm:block">{s}</div>
                {index < steps.length - 1 && (
                  <div className={`w-12 sm:w-20 h-1 mx-3 rounded ${
                    currentStepIndex > index ? 'bg-green-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Upload Step */}
        {step === 'upload' && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Upload Product File</h2>
              <p className="text-gray-500 mt-2">Upload your products_import_full.xlsx or CSV file</p>
            </div>
            <div {...getRootProps()} className={`border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all ${
              isDragActive ? 'border-[#00ff88] bg-green-50' : 'border-gray-300 hover:border-gray-400'
            }`}>
              <input {...getInputProps()} />
              <Upload size={56} className="mx-auto text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-700">
                {isDragActive ? 'Drop your file here' : 'Drag & drop or click to select'}
              </p>
              <p className="text-sm text-gray-500 mt-2">.xlsx, .csv, .json — max 50MB</p>
            </div>
            {file && (
              <div className="mt-6 p-4 bg-white rounded-xl border flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet size={24} className="text-[#00ff88]" />
                  <div>
                    <div className="font-medium text-gray-900">{file.name}</div>
                    <div className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                  </div>
                </div>
                <button onClick={handleParseFile} disabled={loading} className="bg-[#00ff88] text-gray-900 px-6 py-2.5 rounded-lg font-semibold hover:bg-green-400 transition-colors disabled:opacity-50 flex items-center gap-2">
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  Parse File
                </button>
              </div>
            )}
            {error && (
              <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-2">
                <AlertCircle size={18} />
                {error}
              </div>
            )}
          </div>
        )}

        {/* Preview Step */}
        {step === 'preview' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Preview ({parsedProducts.length} products)</h2>
            </div>
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      {['#', 'SKU', 'Title', 'Brand', 'Category', 'MRP', 'Sale Price'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {parsedProducts.slice(0, 10).map((p, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-500">{i + 1}</td>
                        <td className="px-4 py-3 text-sm font-mono text-gray-900">{p.variant_sku || p.sku || '—'}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">{p.product_title || p.title || '—'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{p.brand || '—'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{p.category || '—'}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">₹{p.mrp || '—'}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-green-600">₹{p.sale_price || p.salePrice || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedProducts.length > 10 && (
                <div className="px-4 py-3 bg-gray-50 text-sm text-gray-500 text-center">Showing 10 of {parsedProducts.length} products</div>
              )}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={resetImport} className="px-6 py-2.5 border rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={handleValidate} disabled={loading} className="bg-[#00ff88] text-gray-900 px-6 py-2.5 rounded-lg font-semibold hover:bg-green-400 transition-colors disabled:opacity-50 flex items-center gap-2">
                {loading && <Loader2 size={16} className="animate-spin" />}
                Validate <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Validation Step */}
        {step === 'validation' && validationResults && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Validation Results</h2>
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-white p-6 rounded-xl border shadow-sm">
                <div className="text-3xl font-bold text-gray-900">{validationResults.total}</div>
                <div className="text-sm text-gray-500">Total Products</div>
              </div>
              <div className="bg-white p-6 rounded-xl border shadow-sm">
                <div className="text-3xl font-bold text-green-600">{validationResults.valid}</div>
                <div className="text-sm text-gray-500">Valid</div>
              </div>
              <div className="bg-white p-6 rounded-xl border shadow-sm">
                <div className="text-3xl font-bold text-red-600">{validationResults.invalid}</div>
                <div className="text-sm text-gray-500">Invalid</div>
              </div>
            </div>
            {validationResults.errors && validationResults.errors.length > 0 && (
              <div className="bg-white rounded-xl border shadow-sm p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <AlertCircle size={18} className="text-red-500" />
                  Errors ({validationResults.errors.length})
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {validationResults.errors.map((err, i) => (
                    <div key={i} className="p-3 bg-red-50 rounded-lg text-sm">
                      <span className="font-medium text-red-800">Row {err.row} ({err.sku})</span>
                      <span className="text-red-600 ml-2">{err.field}: {err.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex justify-end gap-3">
              <button onClick={resetImport} className="px-6 py-2.5 border rounded-lg hover:bg-gray-50 flex items-center gap-2">
                <RefreshCw size={16} /> Re-upload
              </button>
              <button onClick={handleImport} disabled={loading} className="bg-[#00ff88] text-gray-900 px-6 py-2.5 rounded-lg font-semibold hover:bg-green-400 disabled:opacity-50 flex items-center gap-2">
                {loading && <Loader2 size={16} className="animate-spin" />}
                Import Products <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Import Step */}
        {step === 'import' && (
          <div className="max-w-md mx-auto text-center py-16">
            <Loader2 size={64} className="mx-auto text-[#00ff88] animate-spin" />
            <h2 className="text-xl font-bold text-gray-900 mt-6">Importing Products...</h2>
            <p className="text-gray-500 mt-2">This may take a moment</p>
            {error && (
              <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-2 justify-center">
                <AlertCircle size={18} />
                {error}
              </div>
            )}
          </div>
        )}

        {/* Done Step */}
        {step === 'done' && (
          <div className="max-w-md mx-auto text-center py-16">
            <CheckCircle size={64} className="mx-auto text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900 mt-6">Import Complete</h2>
            {importSummary && (
              <div className="grid grid-cols-3 gap-4 mt-8">
                <div className="bg-white p-4 rounded-xl border"><div className="text-2xl font-bold text-green-600">{importSummary.created}</div><div className="text-sm text-gray-500">Created</div></div>
                <div className="bg-white p-4 rounded-xl border"><div className="text-2xl font-bold text-blue-600">{importSummary.updated}</div><div className="text-sm text-gray-500">Updated</div></div>
                <div className="bg-white p-4 rounded-xl border"><div className="text-2xl font-bold text-gray-500">{importSummary.skipped}</div><div className="text-sm text-gray-500">Skipped</div></div>
              </div>
            )}
            <div className="flex justify-center gap-3 mt-8">
              <Link href="/admin" className="px-6 py-2.5 border rounded-lg hover:bg-gray-50">Dashboard</Link>
              <button onClick={resetImport} className="bg-[#00ff88] text-gray-900 px-6 py-2.5 rounded-lg font-semibold hover:bg-green-400 flex items-center gap-2">
                <Upload size={16} /> Import Another
              </button>
            </div>
          </div>
        )}

        {/* Reports Section */}
        <div className="mt-12 pt-8 border-t">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Import Reports</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { file: 'validation_report.csv', label: 'Validation Report' },
              { file: 'unmapped_images_report.csv', label: 'Unmapped Images' },
              { file: 'duplicate_images_report.csv', label: 'Duplicate Images' },
            ].map(r => (
              <a key={r.file} href={`/exports/${r.file}`} className="flex items-center gap-3 p-4 bg-white rounded-xl border hover:bg-gray-50 transition-colors">
                <FileDown size={20} className="text-blue-600" />
                <div>
                  <div className="font-medium text-sm">{r.label}</div>
                  <div className="text-xs text-gray-500">{r.file}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}


