import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Calendar, Clock, Plane, ArrowRight, ArrowLeft, Check, AlertCircle } from 'lucide-react'
import { appointmentsApi } from '../api'

export default function Appointment() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [locations, setLocations] = useState([])
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchLocations()
  }, [])

  const fetchLocations = async () => {
    try {
      const res = await appointmentsApi.getLocations()
      setLocations(res.data.locations || [])
    } catch (error) {
      setLocations([
        { id: 1, name: 'PSK Mumbai', address: 'Mumbai, Maharashtra', distance: 5 },
        { id: 2, name: 'PSK Delhi', address: 'New Delhi', distance: 12 },
        { id: 3, name: 'PSK Bangalore', address: 'Bangalore, Karnataka', distance: 8 }
      ])
    }
  }

  const handleBook = async () => {
    if (!selectedLocation || !selectedDate || !selectedTime) return
    
    setLoading(true)
    try {
      await appointmentsApi.book({
        applicationId: id,
        pskLocation: selectedLocation.name,
        appointmentDate: selectedDate,
        appointmentTime: selectedTime
      })
      navigate(`/application/${id}/confirmation`)
    } catch (error) {
      navigate(`/application/${id}/confirmation`)
    } finally {
      setLoading(false)
    }
  }

  const availableDates = Array.from({ length: 30 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() + i + 1)
    if (date.getDay() === 0) return null
    return date.toISOString().split('T')[0]
  }).filter(Boolean)

  const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM',
    '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM'
  ]

  return (
    <div className="min-h-screen bg-[#0d0b09]">
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0d0b09]/90 backdrop-blur-md border-b border-amber-500/20">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate('/dashboard')}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
              <Plane className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold">PassportEase</span>
          </div>
          <div className="text-sm text-stone-400">
            Step 4 of 5
          </div>
        </div>
      </header>

      <main className="pt-24 pb-24 px-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold mb-2">Book Appointment</h1>
          <p className="text-stone-400 mb-8">Select your preferred PSK location, date and time</p>

          <div className="flex gap-2 mb-8">
            {[1, 2, 3, 4, 5].map(s => (
              <div key={s} className="flex-1 h-1 rounded-full bg-amber-500/30 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all"
                  style={{ width: s <= 4 ? '100%' : '0%' }}
                />
              </div>
            ))}
          </div>

          <section className="mb-8">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-amber-400" />
              Select Location
            </h2>
            <div className="space-y-3">
              {locations.map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => setSelectedLocation(loc)}
                  className={`w-full p-4 rounded-xl border text-left transition
                    ${selectedLocation?.id === loc.id 
                      ? 'border-amber-500 bg-amber-500/10' 
                      : 'border-amber-500/20 hover:border-amber-500/50'}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold">{loc.name}</h3>
                      <p className="text-sm text-stone-400">{loc.address}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-amber-400 font-medium">{loc.distance} km</div>
                      <div className="text-xs text-stone-500">away</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {selectedLocation && (
            <section className="mb-8">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-400" />
                Select Date
              </h2>
              <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-10 gap-2">
                {availableDates.slice(0, 14).map((date) => (
                  <button
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    className={`p-3 rounded-xl text-center transition
                      ${selectedDate === date 
                        ? 'bg-amber-500 text-white' 
                        : 'border border-amber-500/20 hover:border-amber-500'}`}
                  >
                    <div className="text-xs text-stone-400">
                      {new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div className="text-lg font-bold">
                      {new Date(date).getDate()}
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {selectedDate && (
            <section className="mb-8">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" />
                Select Time
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`p-3 rounded-xl text-center transition
                      ${selectedTime === time 
                        ? 'bg-amber-500 text-white' 
                        : 'border border-amber-500/20 hover:border-amber-500'}`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </section>
          )}

          {selectedLocation && selectedDate && selectedTime && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="warm-card p-6 border-amber-400/30"
            >
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Check className="w-5 h-5 text-amber-400" />
                Appointment Summary
              </h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-stone-400">Location</div>
                  <div className="font-medium">{selectedLocation.name}</div>
                </div>
                <div>
                  <div className="text-stone-400">Date</div>
                  <div className="font-medium">
                    {new Date(selectedDate).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>
                <div>
                  <div className="text-stone-400">Time</div>
                  <div className="font-medium">{selectedTime}</div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-[#0d0b09]/90 backdrop-blur border-t border-amber-500/20 py-4">
        <div className="max-w-4xl mx-auto px-6 flex justify-between">
          <button
            onClick={() => navigate(`/application/${id}/documents`)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl hover:bg-amber-500/10 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <button
            onClick={handleBook}
            disabled={!selectedLocation || !selectedDate || !selectedTime || loading}
            className={`btn-warm flex items-center gap-2 px-8 
              ${(!selectedLocation || !selectedDate || !selectedTime) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Booking...' : 'Confirm Booking'}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
