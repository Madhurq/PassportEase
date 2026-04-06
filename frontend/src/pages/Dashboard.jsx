import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, FileText, Calendar, Clock, Download, LogOut, User, Settings, Bell, Globe, ChevronRight, RefreshCw, Plane } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { applicationsApi } from '../api'
import { useToast } from '../components/Toast'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      const res = await applicationsApi.getAll()
      setApplications(res.data.applications || [])
    } catch (error) {
      console.error('Failed to fetch applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleNewApplication = async () => {
    try {
      const res = await applicationsApi.create({
        data: {},
        currentStep: 1
      })
      navigate(`/application/${res.data.application.id}`)
    } catch (error) {
      if (error.response?.data?.applicationId) {
        navigate(`/application/${error.response.data.applicationId}`)
      } else {
        toast.error(error.response?.data?.error || 'Failed to create application')
      }
    }
  }

  const getStatusBadge = (status) => {
    const styles = {
      draft: 'status-draft',
      submitted: 'status-submitted',
      under_review: 'status-review',
      ready: 'status-ready',
      completed: 'status-ready'
    }
    const labels = {
      draft: 'Draft',
      submitted: 'Submitted',
      under_review: 'Under Review',
      ready: 'Ready for Pickup',
      completed: 'Completed'
    }
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-500/20 text-gray-400'}`}>
        {labels[status] || status}
      </span>
    )
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-[#0d0b09]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0d0b09]/90 backdrop-blur-md border-b border-amber-500/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate('/dashboard')}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
              <Plane className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">Passport<span className="text-amber-400">Ease</span></span>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              className="p-2 hover:bg-amber-500/10 rounded-lg transition"
              onClick={() => toast.info('No new notifications')}
              title="Notifications"
            >
              <Bell className="w-5 h-5 text-stone-400" />
            </button>
            <button 
              onClick={logout}
              className="p-2 hover:bg-amber-500/10 rounded-lg transition"
              title="Logout"
            >
              <LogOut className="w-5 h-5 text-stone-400" />
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-amber-500/20">
              <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <div className="font-medium">{user?.full_name || 'User'}</div>
                <div className="text-xs text-stone-500">{user?.email}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, <span className="text-amber-400">{user?.full_name?.split(' ')[0] || 'User'}</span>
          </h1>
          <p className="text-stone-400">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </motion.div>

        {/* New Application Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <button 
            onClick={handleNewApplication}
            className="btn-warm py-4 px-8 flex items-center gap-3"
          >
            <Plus className="w-5 h-5" />
            Start New Application
          </button>
        </motion.div>

        {/* Applications List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Your Applications</h2>
            <button 
              onClick={fetchApplications}
              className="p-2 hover:bg-amber-500/10 rounded-lg transition"
            >
              <RefreshCw className="w-4 h-4 text-stone-400" />
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-stone-400">Loading applications...</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="warm-card p-12 text-center">
              <FileText className="w-16 h-16 text-stone-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">No Applications Yet</h3>
              <p className="text-stone-400 mb-6">Start your first passport application today</p>
              <button onClick={handleNewApplication} className="btn-warm">
                Start Application
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((app, i) => (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="warm-card p-6 flex items-center gap-6 group cursor-pointer hover:border-amber-500/50"
                  onClick={() => {
                    if (app.status === 'draft') {
                      navigate(`/application/${app.id}`)
                    } else {
                      navigate(`/application/${app.id}/confirmation`)
                    }
                  }}
                >
                  <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-amber-400" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-mono text-sm text-amber-400/70">{app.id.slice(0, 8).toUpperCase()}</span>
                      {getStatusBadge(app.status)}
                    </div>
                    <div className="text-sm text-stone-400">
                      {app.status === 'draft' 
                        ? `Last updated: ${formatDate(app.updated_at)}`
                        : `Submitted: ${formatDate(app.created_at)}`
                      }
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {app.status !== 'draft' && (
                      <button 
                        className="p-2 hover:bg-amber-500/10 rounded-lg transition"
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/application/${app.id}/confirmation`)
                        }}
                        title="Download Receipt"
                      >
                        <Download className="w-5 h-5 text-stone-400" />
                      </button>
                    )}
                    <ChevronRight className="w-5 h-5 text-stone-600 group-hover:text-amber-400 transition" />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12"
        >
          <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: FileText, label: 'Documents', desc: 'Check requirements', action: () => handleNewApplication() },
              { icon: Calendar, label: 'Book Slot', desc: 'Find PSK', action: () => applications.length > 0 && applications[0].status !== 'draft' ? navigate(`/application/${applications[0].id}/appointment`) : toast.info('Start a new application to book slot') },
              { icon: Clock, label: 'Track Status', desc: 'View updates', action: () => toast.info('Check your application status on dashboard') },
              { icon: Settings, label: 'Settings', desc: 'Profile', action: () => toast.info('Profile settings coming soon') }
            ].map((action, i) => (
              <button
                key={i}
                onClick={action.action}
                className="warm-card p-4 text-left hover:border-amber-500/50 transition group"
              >
                <action.icon className="w-8 h-8 text-amber-400 mb-2 group-hover:text-amber-300 transition" />
                <div className="font-medium">{action.label}</div>
                <div className="text-xs text-stone-500">{action.desc}</div>
              </button>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  )
}
