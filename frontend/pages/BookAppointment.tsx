
import React, { useState, useEffect } from 'react';
import { getDentists, getAppointments, updateAppointment, bookAppointment } from '../services/Api';
import { Dentist } from '../types';
import { useAuth } from '../App';

interface BookAppointmentProps {
  onNavigate: (page: string) => void;
  editId?: string;
}

const BookAppointment: React.FC<BookAppointmentProps> = ({ onNavigate, editId }) => {
  const { auth } = useAuth();
  const [dentists, setDentists] = useState<Dentist[]>([]);
  const [filter, setFilter] = useState<string>('All');
  const [selectedDentist, setSelectedDentist] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const d = await getDentists();
        setDentists(d);

        if (editId) {
          const apps = await getAppointments();
          const toEdit = apps.find((a) => a.id === editId);
          if (toEdit) {
            setSelectedDentist(toEdit.dentistId);
            setSelectedDate(toEdit.dateTime.split('T')[0]);
            const timePart = toEdit.dateTime.split('T')[1];
            setSelectedTime(timePart ? timePart.substring(0, 5) : '');
          }
        }
      } catch (err) {
        console.error('Failed to load clinic data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [editId]);

  const filteredDentists = filter === 'All' 
    ? dentists 
    : dentists.filter(d => d.specialization === filter);

  const specializations = ['All', ...new Set(dentists.map(d => d.specialization))];

  const handleBook = async () => {
    if (!selectedDentist || !selectedDate || !selectedTime) return alert('Please fill all fields');
    
    setSubmitting(true);
    try {
      const dateTime = `${selectedDate}T${selectedTime}:00`;
      if (editId) {
        await updateAppointment(editId, dateTime);
        alert('Appointment rescheduled successfully!');
      } else {
        await bookAppointment({ dentistId: selectedDentist, dateTime });
        alert('Appointment booked successfully!');
      }
      onNavigate('dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Action failed';
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-20 text-center flex flex-col items-center"><div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>Loading Clinic Data...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
        <div className="bg-blue-600 px-8 py-10 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold">{editId ? 'Reschedule Appointment' : 'Book an Appointment'}</h1>
            <p className="text-blue-100 mt-2">Personalized care starts with a single click.</p>
          </div>
          <button onClick={() => onNavigate('dashboard')} className="text-sm bg-blue-500 hover:bg-blue-400 px-4 py-2 rounded-lg transition font-semibold self-start">Back to Dashboard</button>
        </div>

        <div className="p-8 space-y-10">
          {/* Specialization Filter */}
          <div className="flex flex-wrap gap-2 pb-2 border-b border-gray-50">
            {specializations.map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition ${filter === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Step 1: Select Dentist */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-6 uppercase tracking-wider">Step 1: Choose Your Dentist</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDentists.map(dentist => (
                <button
                  key={dentist.id}
                  onClick={() => setSelectedDentist(dentist.id)}
                  className={`relative p-6 rounded-2xl text-left border-2 transition group ${selectedDentist === dentist.id ? 'border-blue-600 bg-blue-50 shadow-md' : 'border-gray-100 hover:border-blue-200 hover:bg-gray-50'}`}
                >
                  {selectedDentist === dentist.id && (
                    <div className="absolute -top-3 -right-3 bg-blue-600 text-white rounded-full p-1 shadow-lg">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                  )}
                  <div className="flex items-center gap-4 mb-4">
                    <img src={dentist.imageUrl} className="w-14 h-14 rounded-full border-2 border-white shadow-sm" alt={dentist.name} />
                    <div>
                      <p className="font-bold text-gray-900 group-hover:text-blue-600 transition">{dentist.name}</p>
                      <p className="text-xs text-blue-600 font-semibold uppercase tracking-tight">{dentist.specialization}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{dentist.bio || 'No bio available.'}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Date & Time */}
          {selectedDentist && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 pt-10 border-t border-gray-100">
              <div className="animate-in fade-in duration-500">
                <label className="block text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                   <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                   Select Visit Date
                </label>
                <input
                  type="date"
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition outline-none"
                  min={new Date().toISOString().split('T')[0]}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
              <div className="animate-in fade-in slide-in-from-right duration-500">
                <label className="block text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                   <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                   Available Time Slots
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-3">
                  {['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00'].map(slot => (
                    <button
                      key={slot}
                      onClick={() => setSelectedTime(slot)}
                      className={`p-3 rounded-xl text-sm font-bold transition border-2 ${selectedTime === slot ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-gray-600 border-gray-100 hover:border-blue-200'}`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="pt-10 border-t border-gray-100">
            <button
              disabled={submitting || !selectedTime || !selectedDate}
              onClick={handleBook}
              className="w-full bg-blue-600 text-white py-5 rounded-2xl font-bold text-xl shadow-xl shadow-blue-100 hover:bg-blue-700 transition transform active:scale-95 disabled:opacity-50 disabled:active:scale-100"
            >
              {submitting ? 'Processing...' : (editId ? 'Confirm Reschedule' : 'Secure My Appointment')}
            </button>
            <p className="text-center text-xs text-gray-400 mt-4 italic">By confirming, you agree to our clinic's cancellation policy.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;
