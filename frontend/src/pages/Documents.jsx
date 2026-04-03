import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Upload, FileText, Check, X, Plane, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react'
import { documentsApi } from '../api'
import { useToast } from '../components/Toast'

const documentTypes = [
  { id: 'id_proof', name: 'ID Proof', required: true, formats: 'PDF, JPG, PNG (max 5MB)', example: 'Aadhaar/PAN/Voter ID' },
  { id: 'address_proof', name: 'Address Proof', required: true, formats: 'PDF, JPG, PNG (max 5MB)', example: 'Utility Bill/Bank Statement' },
  { id: 'photo', name: 'Passport Photo', required: true, formats: 'JPG, PNG (max 2MB)', example: 'White background, 50x50mm' },
  { id: 'signature', name: 'Signature', required: true, formats: 'JPG, PNG (max 1MB)', example: 'White background' }
]

export default function Documents() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [uploadedDocs, setUploadedDocs] = useState({})
  const [uploading, setUploading] = useState(null)

  useEffect(() => {
    fetchDocuments()
  }, [id])

  const fetchDocuments = async () => {
    try {
      const res = await documentsApi.getForApplication(id)
      const docs = {}
      res.data.documents?.forEach(doc => {
        docs[doc.type] = doc
      })
      setUploadedDocs(docs)
    } catch (error) {
      console.error('Failed to fetch documents:', error)
    }
  }

  const handleUploadClick = (docId) => {
    document.getElementById(`file-upload-${docId}`).click()
  }

  const handleFileChange = async (e, docType) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(docType)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('applicationId', id)
      formData.append('docType', docType)

      const res = await documentsApi.upload(formData)
      
      setUploadedDocs(prev => ({
        ...prev,
        [docType]: res.data.document
      }))
      toast.success(`${documentTypes.find(d => d.id === docType)?.name || 'Document'} uploaded successfully`)
    } catch (error) {
      console.error('Failed to upload document:', error)
      toast.error(error.response?.data?.error || 'Failed to upload document')
    } finally {
      setUploading(null)
      e.target.value = '' // Reset input
    }
  }

  const canProceed = documentTypes.every(doc => uploadedDocs[doc.id])

  return (
    <div className="min-h-screen bg-[#0d0b09]">
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0d0b09]/90 backdrop-blur-md border-b border-amber-500/20">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
              <Plane className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold">PassportEase</span>
          </div>
          <div className="text-sm text-stone-400">
            Step 3 of 5
          </div>
        </div>
      </header>

      <main className="pt-24 pb-24 px-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold mb-2">Upload Documents</h1>
          <p className="text-stone-400 mb-8">Upload the required documents to proceed</p>

          <div className="flex gap-2 mb-8">
            {[1, 2, 3, 4, 5].map(s => (
              <div key={s} className="flex-1 h-1 rounded-full bg-amber-500/30 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all"
                  style={{ width: s <= 3 ? '100%' : '0%' }}
                />
              </div>
            ))}
          </div>

          <div className="space-y-4">
            {documentTypes.map((doc, i) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="warm-card p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center
                      ${uploadedDocs[doc.id] ? 'bg-amber-400/20' : 'bg-amber-500/20'}`}>
                      {uploadedDocs[doc.id] ? (
                        <Check className="w-5 h-5 text-amber-400" />
                      ) : (
                        <FileText className="w-5 h-5 text-amber-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold">{doc.name}</h3>
                      <p className="text-sm text-stone-400">{doc.example}</p>
                    </div>
                  </div>
                  {uploadedDocs[doc.id] && (
                    <button
                      onClick={() => setUploadedDocs(prev => {
                        const next = { ...prev }
                        delete next[doc.id]
                        return next
                      })}
                      className="text-xs text-red-400 hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="bg-[#0d0b09]/50 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 text-sm text-stone-400 mb-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>Format: {doc.formats}</span>
                  </div>
                </div>

                {uploadedDocs[doc.id] ? (
                  <div className="flex items-center gap-3 p-4 bg-amber-400/10 border border-amber-400/30 rounded-xl">
                    <Check className="w-5 h-5 text-amber-400" />
                    <span className="text-amber-400">Document uploaded successfully</span>
                  </div>
                ) : uploading === doc.id ? (
                  <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                    <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                    <span>Uploading...</span>
                  </div>
                ) : (
                  <>
                    <input
                      type="file"
                      id={`file-upload-${doc.id}`}
                      className="hidden"
                      onChange={(e) => handleFileChange(e, doc.id)}
                      accept={doc.id === 'photo' || doc.id === 'signature' ? '.jpg,.jpeg,.png' : '.jpg,.jpeg,.png,.pdf'}
                    />
                    <button
                      onClick={() => handleUploadClick(doc.id)}
                      className="w-full py-4 border-2 border-dashed border-amber-500/30 rounded-xl hover:border-amber-500 hover:bg-amber-500/5 transition flex items-center justify-center gap-2"
                    >
                      <Upload className="w-5 h-5" />
                      Click to Upload {doc.name}
                    </button>
                  </>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-[#0d0b09]/90 backdrop-blur border-t border-amber-500/20 py-4">
        <div className="max-w-4xl mx-auto px-6 flex justify-between">
          <button
            onClick={() => navigate(`/application/${id}`)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl hover:bg-amber-500/10 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <button
            onClick={() => navigate(`/application/${id}/appointment`)}
            disabled={!canProceed}
            className={`btn-warm flex items-center gap-2 px-8 ${!canProceed ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Continue
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
