import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plane, FileText, Upload, Calendar, CheckCircle, ArrowRight, Clock } from 'lucide-react'

const steps = [
  { num: '01', title: 'Personal Details', desc: 'Name, DOB, Gender', time: '~5 min' },
  { num: '02', title: 'Family Details', desc: 'Parent information', time: '~3 min' },
  { num: '03', title: 'Document Upload', desc: 'ID, Address, Photo', time: '~5 min' },
  { num: '04', title: 'Appointment', desc: 'Choose date & location', time: '~3 min' },
  { num: '05', title: 'Confirm & Pay', desc: 'Payment & submit', time: '~2 min' }
]

const documents = [
  'ID Proof (Aadhaar/PAN/Voter ID)',
  'Address Proof',
  'Passport Photo',
  'Signature (digital)'
]

export default function Onboarding() {
  const navigate = useNavigate()

  const handleStart = () => {
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 warm-grid">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="w-20 h-20 bg-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6"
          >
            <span className="text-4xl">👋</span>
          </motion.div>
          <h1 className="text-4xl font-bold mb-2">Welcome to PassportEase</h1>
          <p className="text-stone-400">Here's what you'll need to complete your application</p>
        </div>

        <div className="space-y-3 mb-8">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="warm-card p-4 flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center text-amber-400 font-bold">
                {step.num}
              </div>
              <div className="flex-1">
                <h3 className="font-bold">{step.title}</h3>
                <p className="text-sm text-stone-400">{step.desc}</p>
              </div>
              <div className="flex items-center gap-1 text-amber-400/70 text-sm">
                <Clock className="w-4 h-4" />
                {step.time}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="warm-card p-6 mb-8"
        >
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            Documents You'll Need
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {documents.map((doc, i) => (
              <div key={i} className="flex items-center gap-2 text-stone-300">
                <CheckCircle className="w-4 h-4 text-amber-400" />
                <span className="text-sm">{doc}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex justify-center gap-8 mb-8 text-center"
        >
          <div>
            <div className="text-3xl font-bold text-amber-400">15-20</div>
            <div className="text-sm text-stone-400">Minutes</div>
          </div>
          <div className="w-px bg-amber-500/30" />
          <div>
            <div className="text-3xl font-bold text-orange-400">4</div>
            <div className="text-sm text-stone-400">Documents</div>
          </div>
          <div className="w-px bg-amber-500/30" />
          <div>
            <div className="text-3xl font-bold text-amber-500">100%</div>
            <div className="text-sm text-stone-400">Secure</div>
          </div>
        </motion.div>

        <div className="flex gap-4">
          <button
            onClick={handleStart}
            className="btn-warm flex-1 py-4 text-lg flex items-center justify-center gap-2"
          >
            Let's Begin <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        <p className="text-center text-stone-500 mt-4 text-sm">
          💾 You can save and continue anytime
        </p>
      </motion.div>
    </div>
  )
}
