import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, Download, Share2, Calendar, FileText, MapPin, Clock, Plane, Home, Copy, Check } from 'lucide-react'
import { applicationsApi } from '../api'
import { useToast } from '../components/Toast'

export default function Confirmation() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [applicationData, setApplicationData] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchApplicationData()
  }, [id])

  const fetchApplicationData = async () => {
    try {
      const res = await applicationsApi.export(id)
      setApplicationData(res.data)
    } catch (error) {
      console.error('Failed to fetch:', error)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(id.toUpperCase())
    setCopied(true)
    toast.success('Application ID copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  const exportData = applicationData?.exportData || {}

  const generatePDF = (type) => {
    if (!exportData.applicationId) return
    
    const isAppt = type === 'appointment'
    const title = isAppt ? 'Appointment Letter' : 'Application Receipt'
    
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <html>
        <head>
          <title>PassportEase - ${title}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; line-height: 1.6; }
            .header { border-bottom: 2px solid #ea580c; padding-bottom: 20px; margin-bottom: 30px; }
            h1 { color: #ea580c; margin: 0; }
            .meta { color: #666; font-size: 0.9em; margin-top: 10px; }
            .section { margin-bottom: 25px; background: #f9f9f9; padding: 20px; border-radius: 8px; border: 1px solid #eee; }
            h2 { font-size: 1.2em; color: #444; border-bottom: 1px solid #ddd; padding-bottom: 10px; margin-top: 0; }
            table { width: 100%; border-collapse: collapse; }
            td { padding: 10px 0; border-bottom: 1px solid #eee; }
            td:first-child { font-weight: bold; width: 40%; color: #555; }
            .footer { margin-top: 50px; font-size: 0.85em; color: #888; text-align: center; border-top: 1px solid #eee; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>PassportEase</h1>
            <div class="meta">Official ${title} • Generated on ${new Date().toLocaleDateString()}</div>
          </div>
          
          <div class="section">
            <h2>Application Details</h2>
            <table>
              <tr><td>Application ID</td><td><strong>${exportData.applicationId.toUpperCase()}</strong></td></tr>
              <tr><td>Applicant Name</td><td>${exportData.applicantName}</td></tr>
              <tr><td>Email</td><td>${exportData.applicantEmail}</td></tr>
              <tr><td>Application Type</td><td>${exportData.applicationType}</td></tr>
              <tr><td>Submission Date</td><td>${new Date(exportData.submittedAt).toLocaleDateString()}</td></tr>
              <tr><td>Current Status</td><td>${exportData.status.toUpperCase()}</td></tr>
            </table>
          </div>
          
          ${exportData.appointment ? `
          <div class="section">
            <h2>Appointment Details</h2>
            <table>
              <tr><td>PSK Location</td><td>${exportData.appointment.location}</td></tr>
              <tr><td>Date</td><td>${new Date(exportData.appointment.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td></tr>
              <tr><td>Time Slot</td><td><strong>${exportData.appointment.time}</strong></td></tr>
            </table>
          </div>
          ` : ''}
          
          ${!isAppt && exportData.documents?.length ? `
          <div class="section">
            <h2>Uploaded Documents</h2>
            <table>
              ${exportData.documents.map(d => `
                <tr><td>${d.type.replace('_', ' ').toUpperCase()}</td><td>${d.fileName}</td></tr>
              `).join('')}
            </table>
          </div>
          ` : ''}
          
          <div class="footer">
            <p>Please carry this document along with all original uploaded proofs to your PSK appointment.</p>
            <p>© ${new Date().getFullYear()} PassportEase</p>
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    
    // Wait for styles to load then print
    printWindow.onload = () => {
      printWindow.print()
      // Firefox requires timeout
      setTimeout(() => printWindow.close(), 500)
    }
  }

  return (
    <div className="min-h-screen bg-[#0d0b09]">
      <main className="pt-12 pb-12 px-6 max-w-3xl mx-auto">
        <Link to="/dashboard" className="flex items-center gap-2 mb-8 w-fit mx-auto">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
            <Plane className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold">PassportEase</span>
        </Link>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-24 h-24 bg-amber-400/20 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-12 h-12 text-amber-400" />
          </motion.div>
          
          <h1 className="text-4xl font-bold mb-2">
            Application <span className="text-amber-400">Submitted!</span>
          </h1>
          <p className="text-stone-400">
            Your passport application has been successfully submitted
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="warm-card p-6 mb-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-stone-400 mb-1">Application ID</div>
              <div className="text-2xl font-mono font-bold text-amber-400">
                {id?.slice(0, 8).toUpperCase()}
              </div>
            </div>
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-amber-500/30 hover:border-amber-500 transition"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-amber-400" />
                  <span className="text-amber-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy ID</span>
                </>
              )}
            </button>
          </div>
        </motion.div>

        {exportData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="warm-card p-6 mb-6"
          >
            <h2 className="font-bold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-400" />
              Application Summary
            </h2>
            
            <div className="grid gap-4 text-sm">
              <div className="flex justify-between py-2 border-b border-amber-500/10">
                <span className="text-stone-400">Applicant</span>
                <span className="font-medium">{exportData.applicantName || 'User'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-amber-500/10">
                <span className="text-stone-400">Type</span>
                <span className="font-medium">{exportData.applicationType}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-amber-500/10">
                <span className="text-stone-400">Submitted On</span>
                <span className="font-medium">
                  {new Date(exportData.submittedAt).toLocaleDateString()}
                </span>
              </div>
              {exportData.appointment && (
                <>
                  <div className="flex justify-between py-2 border-b border-amber-500/10">
                    <span className="text-stone-400">PSK Location</span>
                    <span className="font-medium">{exportData.appointment.location}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-amber-500/10">
                    <span className="text-stone-400">Appointment</span>
                    <span className="font-medium">
                      {exportData.appointment.date} at {exportData.appointment.time}
                    </span>
                  </div>
                </>
              )}
              <div className="flex justify-between py-2">
                <span className="text-stone-400">Status</span>
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-medium">
                  {exportData.status}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-3 mb-6"
        >
          <h2 className="font-bold mb-4 flex items-center gap-2">
            <Download className="w-5 h-5 text-amber-400" />
            Download Documents
          </h2>
          
          <button 
            onClick={() => generatePDF('receipt')}
            className="w-full p-4 rounded-xl border border-amber-500/20 hover:border-amber-500 transition flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-amber-400" />
              <div className="text-left">
                <div className="font-medium">Application Receipt</div>
                <div className="text-xs text-stone-400">PDF Document</div>
              </div>
            </div>
            <Download className="w-5 h-5 text-stone-500 group-hover:text-amber-400 transition" />
          </button>

          <button 
            onClick={() => generatePDF('appointment')}
            className="w-full p-4 rounded-xl border border-amber-500/20 hover:border-amber-500 transition flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-amber-400" />
              <div className="text-left">
                <div className="font-medium">Appointment Letter</div>
                <div className="text-xs text-stone-400">PDF Document</div>
              </div>
            </div>
            <Download className="w-5 h-5 text-stone-500 group-hover:text-amber-400 transition" />
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="warm-card p-6 mb-8 bg-amber-500/5"
        >
          <h2 className="font-bold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-orange-400" />
            What's Next?
          </h2>
          
          <ol className="space-y-3 text-sm">
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-xs font-bold">1</span>
              <span>Visit the PSK on your appointment date with all original documents</span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-xs font-bold">2</span>
              <span>Biometric verification (photo & fingerprints) will be taken</span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-xs font-bold">3</span>
              <span>Track your application status on the dashboard</span>
            </li>
          </ol>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <button
            onClick={() => navigate('/dashboard')}
            className="flex-1 btn-warm py-4 flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Go to Dashboard
          </button>
          <button
            onClick={copyToClipboard}
            className="flex-1 py-4 px-6 rounded-xl border border-amber-500/30 hover:border-amber-500 transition flex items-center justify-center gap-2"
          >
            <Share2 className="w-5 h-5" />
            Share Application ID
          </button>
        </motion.div>
      </main>
    </div>
  )
}
