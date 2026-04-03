import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Save, ArrowRight, ArrowLeft, Plane, Check, AlertCircle } from 'lucide-react'
import { applicationsApi } from '../api'
import { useToast } from '../components/Toast'

const steps = [
  { num: 1, title: 'Personal', fields: ['firstName', 'lastName', 'dob', 'gender', 'placeOfBirth', 'nationality'] },
  { num: 2, title: 'Family', fields: ['fatherName', 'fatherDob', 'motherName', 'motherDob'] },
  { num: 3, title: 'Address', fields: ['currentAddress', 'permanentAddress'] },
  { num: 4, title: 'Travel', fields: ['passportType', 'purpose', 'country'] },
  { num: 5, title: 'Review', fields: [] }
]

export default function ApplicationForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState(null)
  const [formData, setFormData] = useState({})
  const [applicationId, setApplicationId] = useState(id || null)
  const [errors, setErrors] = useState({})
  const toast = useToast()

  useEffect(() => {
    if (id) {
      fetchApplication()
    }
  }, [id])

  useEffect(() => {
    const interval = setInterval(() => {
      if (applicationId && Object.keys(formData).length > 0) {
        saveDraft()
      }
    }, 10000)
    return () => clearInterval(interval)
  }, [applicationId, formData])

  const fetchApplication = async () => {
    try {
      const res = await applicationsApi.getOne(id)
      setFormData(res.data.application?.form_data || {})
      setCurrentStep(res.data.application?.current_step || 1)
    } catch (error) {
      console.error('Failed to fetch application:', error)
    }
  }

  const saveDraft = async (showToast = false) => {
    if (!applicationId) return
    setSaving(true)
    try {
      await applicationsApi.update(applicationId, {
        form_data: formData,
        current_step: currentStep,
        status: 'draft'
      })
      setLastSaved(new Date())
      if (showToast) {
        toast.info(`Draft saved at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`)
      }
    } catch (error) {
      console.error('Failed to save:', error)
      if (showToast) toast.error('Failed to save draft')
    } finally {
      setSaving(false)
    }
  }

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const validateStep = () => {
    const newErrors = {}
    
    if (currentStep === 1) {
      if (!formData.firstName) newErrors.firstName = 'First name is required'
      if (!formData.lastName) newErrors.lastName = 'Last name is required'
      if (!formData.dob) newErrors.dob = 'Date of birth is required'
      if (!formData.gender) newErrors.gender = 'Gender is required'
      if (!formData.nationality) newErrors.nationality = 'Nationality is required'
    } else if (currentStep === 2) {
      if (!formData.fatherName) newErrors.fatherName = "Father's name is required"
      if (!formData.motherName) newErrors.motherName = "Mother's name is required"
    } else if (currentStep === 3) {
      if (!formData.currentAddress) newErrors.currentAddress = 'Current address is required'
      if (!formData.city) newErrors.city = 'City is required'
      if (!formData.pincode) {
        newErrors.pincode = 'Pincode is required'
      } else if (!/^\d{6}$/.test(formData.pincode)) {
        newErrors.pincode = 'Invalid pincode format'
      }
    } else if (currentStep === 4) {
      if (!formData.passportType) newErrors.passportType = 'Passport type is required'
      if (!formData.purpose) newErrors.purpose = 'Purpose of travel is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (!validateStep()) {
      toast.error('Please fill in all required fields correctly')
      return
    }

    if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
      saveDraft()
    } else {
      navigate(`/application/${applicationId}/documents`)
    }
  }

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-5">
            <h3 className="text-lg font-bold mb-4">Personal Details</h3>
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium mb-2">First Name *</label>
                <input
                  type="text"
                  value={formData.firstName || ''}
                  onChange={(e) => updateField('firstName', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl"
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Last Name *</label>
                <input
                  type="text"
                  value={formData.lastName || ''}
                  onChange={(e) => updateField('lastName', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl"
                  placeholder="Enter last name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Date of Birth *</label>
                <input
                  type="date"
                  value={formData.dob || ''}
                  onChange={(e) => updateField('dob', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Gender *</label>
                <select
                  value={formData.gender || ''}
                  onChange={(e) => updateField('gender', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Place of Birth</label>
                <input
                  type="text"
                  value={formData.placeOfBirth || ''}
                  onChange={(e) => updateField('placeOfBirth', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl"
                  placeholder="City"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Nationality *</label>
                <select
                  value={formData.nationality || ''}
                  onChange={(e) => updateField('nationality', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl"
                >
                  <option value="">Select</option>
                  <option value="indian">Indian</option>
                </select>
              </div>
            </div>
          </div>
        )
      case 2:
        return (
          <div className="space-y-5">
            <h3 className="text-lg font-bold mb-4">Family Details</h3>
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium mb-2">Father's Name *</label>
                <input
                  type="text"
                  value={formData.fatherName || ''}
                  onChange={(e) => updateField('fatherName', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl"
                  placeholder="Enter father's name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Father's DOB</label>
                <input
                  type="date"
                  value={formData.fatherDob || ''}
                  onChange={(e) => updateField('fatherDob', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Mother's Name *</label>
                <input
                  type="text"
                  value={formData.motherName || ''}
                  onChange={(e) => updateField('motherName', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl"
                  placeholder="Enter mother's name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Mother's DOB</label>
                <input
                  type="date"
                  value={formData.motherDob || ''}
                  onChange={(e) => updateField('motherDob', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl"
                />
              </div>
            </div>
          </div>
        )
      case 3:
        return (
          <div className="space-y-5">
            <h3 className="text-lg font-bold mb-4">Address Details</h3>
            <div className="mb-6">
              <label className="flex items-center gap-2 mb-4 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="w-5 h-5 rounded"
                  checked={formData.sameAddress || false}
                  onChange={(e) => updateField('sameAddress', e.target.checked)}
                />
                <span>Same as current address</span>
              </label>
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Current Address *</label>
                <textarea
                  value={formData.currentAddress || ''}
                  onChange={(e) => updateField('currentAddress', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl"
                  rows={3}
                  placeholder="Enter your address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">City *</label>
                <input
                  type="text"
                  value={formData.city || ''}
                  onChange={(e) => updateField('city', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Pincode *</label>
                <input
                  type="text"
                  value={formData.pincode || ''}
                  onChange={(e) => updateField('pincode', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl"
                  maxLength={6}
                />
              </div>
            </div>
          </div>
        )
      case 4:
        return (
          <div className="space-y-5">
            <h3 className="text-lg font-bold mb-4">Travel Details</h3>
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium mb-2">Passport Type *</label>
                <select
                  value={formData.passportType || ''}
                  onChange={(e) => updateField('passportType', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl"
                >
                  <option value="">Select Type</option>
                  <option value="fresh">Fresh Passport</option>
                  <option value="renewal">Renewal</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Purpose of Travel *</label>
                <select
                  value={formData.purpose || ''}
                  onChange={(e) => updateField('purpose', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl"
                >
                  <option value="">Select Purpose</option>
                  <option value="tourism">Tourism</option>
                  <option value="business">Business</option>
                  <option value="study">Study</option>
                  <option value="work">Work</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Intended Country</label>
                <input
                  type="text"
                  value={formData.country || ''}
                  onChange={(e) => updateField('country', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl"
                  placeholder="Where do you plan to travel?"
                />
              </div>
            </div>
          </div>
        )
      case 5:
        return (
          <div className="space-y-5">
            <h3 className="text-lg font-bold mb-4">Review Your Information</h3>
            <div className="warm-card p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-stone-400">Name</div>
                  <div className="font-medium">{formData.firstName} {formData.lastName}</div>
                </div>
                <div>
                  <div className="text-sm text-stone-400">Date of Birth</div>
                  <div className="font-medium">{formData.dob || 'Not provided'}</div>
                </div>
                <div>
                  <div className="text-sm text-stone-400">Gender</div>
                  <div className="font-medium capitalize">{formData.gender || 'Not provided'}</div>
                </div>
                <div>
                  <div className="text-sm text-stone-400">Nationality</div>
                  <div className="font-medium">{formData.nationality || 'Not provided'}</div>
                </div>
              </div>
            </div>
            <p className="text-sm text-stone-400">
              Please review your information before proceeding. You can go back to make changes.
            </p>
          </div>
        )
      default:
        return null
    }
  }

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
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-stone-400">
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : lastSaved ? (
                <>
                  <Check className="w-4 h-4 text-amber-400" />
                  <span>Last saved at {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </>
              ) : null}
            </div>
            <button 
              onClick={() => saveDraft(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-amber-500/30 hover:border-amber-500 transition"
            >
              <Save className="w-4 h-4" />
              Save & Exit
            </button>
          </div>
        </div>
      </header>

      <div className="fixed top-16 left-0 right-0 z-40 bg-[#0d0b09]/50 backdrop-blur border-b border-amber-500/10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {steps.map((step, i) => (
              <div key={i} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition
                  ${i + 1 < currentStep ? 'bg-amber-400 text-black' : 
                    i + 1 === currentStep ? 'bg-amber-500 text-white' : 
                    'bg-amber-500/20 text-stone-500'}`}
                >
                  {i + 1 < currentStep ? <Check className="w-5 h-5" /> : step.num}
                </div>
                {i < steps.length - 1 && (
                  <div className={`w-16 sm:w-24 h-0.5 mx-2 ${i + 1 < currentStep ? 'bg-amber-400' : 'bg-amber-500/20'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <main className="pt-40 pb-24 px-6 max-w-4xl mx-auto">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="warm-card p-8"
        >
          {renderStep()}
        </motion.div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-[#0d0b09]/90 backdrop-blur border-t border-amber-500/20 py-4">
        <div className="max-w-4xl mx-auto px-6 flex justify-between">
          <button
            onClick={handlePrev}
            disabled={currentStep === 1}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl transition
              ${currentStep === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-amber-500/10'}`}
          >
            <ArrowLeft className="w-5 h-5" />
            Previous
          </button>
          <button
            onClick={handleNext}
            className="btn-warm flex items-center gap-2 px-8"
          >
            {currentStep === 5 ? 'Continue to Documents' : 'Next'}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
