import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, MapPin, Clock, Shield, FileText, Upload, Calendar, CheckCircle, Plane } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Landing() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const handleStart = () => {
    if (user) {
      navigate('/dashboard')
    } else {
      navigate('/onboarding')
    }
  }

  return (
    <div className="min-h-screen bg-[#0d0b09] text-white overflow-hidden">
      
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1612] via-[#0d0b09] to-[#0d0b09]" />
        <motion.div 
          animate={{ 
            x: [0, 100, 0], 
            y: [0, -50, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute top-20 left-10 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl" 
        />
        <motion.div 
          animate={{ 
            x: [0, -80, 0], 
            y: [0, 80, 0],
            scale: [1, 1.3, 1]
          }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute bottom-20 right-10 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl" 
        />
        <div className="absolute inset-0 opacity-[0.03]" 
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '50px 50px' }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <Plane className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">Passport<span className="text-amber-400">Ease</span></span>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <button 
              onClick={() => navigate('/login')}
              className="text-stone-400 hover:text-white transition font-medium"
            >
              Sign In
            </button>
            <button 
              onClick={() => navigate('/signup')}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-semibold px-5 py-2.5 rounded-full transition-all shadow-lg hover:shadow-amber-500/25"
            >
              Get Started
            </button>
          </motion.div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-12 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur border border-white/10 rounded-full mb-6"
              >
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-sm text-stone-300">Trusted by 50,000+ applicants</span>
              </motion.div>

              <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
                Your Journey
                <br />
                <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent">
                  Starts Here
                </span>
              </h1>
              
              <p className="text-xl text-stone-400 mb-8 max-w-lg">
                Apply for your passport in minutes, not days. Simple, secure, and designed for everyone.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={handleStart}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-semibold px-8 py-4 rounded-full flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-amber-500/30 hover:scale-105"
                >
                  <span>Start Application</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => {
                    if (user) {
                      navigate('/dashboard')
                    } else {
                      navigate('/login')
                    }
                  }}
                  className="px-8 py-4 rounded-full border border-white/20 text-white font-medium hover:bg-white/5 transition flex items-center justify-center gap-2"
                >
                  Track Application
                </button>
              </div>

              <div className="flex items-center gap-6 mt-8 text-sm text-stone-500">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span>Secure</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>15 min avg</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>98% approval</span>
                </div>
              </div>
            </motion.div>

            {/* Right - Visual with Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative w-full mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 blur-3xl opacity-20 rounded-3xl" />
                
                {/* Stock Image - Travel/Passport theme */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                  <img 
                    src="https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=600&h=400&fit=crop"
                    alt="Passport and travel"
                    className="w-full h-auto object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d0b09]/60 to-transparent" />
                  
                  {/* Overlay card */}
                  <div className="absolute bottom-4 left-4 right-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-stone-300">Application Status</p>
                        <p className="font-semibold text-white">Processing...</p>
                      </div>
                      <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating elements */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -top-4 -right-4 bg-[#1a1612] border border-amber-500/30 p-3 rounded-xl shadow-lg"
                >
                  <FileText className="w-6 h-6 text-amber-400" />
                </motion.div>
                
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute -bottom-4 -left-4 bg-[#1a1612] border border-orange-500/30 p-3 rounded-xl shadow-lg"
                >
                  <Upload className="w-6 h-6 text-orange-400" />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="relative z-10 py-20 px-6 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Four Simple <span className="text-amber-400">Steps</span>
            </h2>
            <p className="text-stone-400">From application to approval - we've made it effortless</p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { num: '01', icon: FileText, title: 'Fill Form', desc: 'Quick online form' },
              { num: '02', icon: Upload, title: 'Upload Docs', desc: 'Secure upload' },
              { num: '03', icon: Calendar, title: 'Book Slot', desc: 'Pick your date' },
              { num: '04', icon: CheckCircle, title: 'Get Passport', desc: 'Visit & collect' }
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="bg-[#1a1612] border border-white/10 rounded-2xl p-6 text-center hover:border-amber-500/30 transition">
                  <div className="text-5xl font-bold text-white/10 mb-4">{step.num}</div>
                  <div className="w-12 h-12 mx-auto bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl flex items-center justify-center mb-4">
                    <step.icon className="w-6 h-6 text-amber-400" />
                  </div>
                  <h3 className="font-bold text-lg mb-1">{step.title}</h3>
                  <p className="text-sm text-stone-500">{step.desc}</p>
                </div>
                {i < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 text-stone-600">
                    →
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Clock, title: 'Lightning Fast', desc: 'Complete in 15-30 minutes instead of days' },
              { icon: Shield, title: 'Secure & Safe', desc: 'Bank-level encryption protects your data' },
              { icon: MapPin, title: 'Track Anywhere', desc: 'Real-time updates on your application' }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-[#1a1612] border border-white/10 rounded-2xl p-6 hover:border-amber-500/30 transition"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-amber-400" />
                </div>
                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-stone-400 text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-20 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="bg-gradient-to-br from-[#1a1612] to-[#0d0b09] border border-white/10 rounded-3xl p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to <span className="text-amber-400">Travel</span>?
              </h2>
              <p className="text-stone-400 mb-8">
                Join thousands who've already applied through PassportEase
              </p>
              <button 
                onClick={handleStart}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-semibold px-10 py-4 rounded-full inline-flex items-center gap-2 transition-all shadow-lg hover:shadow-amber-500/30 hover:scale-105"
              >
                Apply Now
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-stone-500">
          <div>© 2024 PassportEase. All rights reserved.</div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition">Privacy</a>
            <a href="#" className="hover:text-white transition">Terms</a>
            <a href="#" className="hover:text-white transition">Support</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
