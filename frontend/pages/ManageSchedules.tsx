
import React, { useState, useEffect } from 'react';
import { getDentists, getSchedules, saveSchedule, deleteSchedule } from '../services/Api';
import { Dentist, Schedule } from '../types';

interface ManageSchedulesProps {
  onNavigate: (page: string) => void;
}

const ManageSchedules: React.FC<ManageSchedulesProps> = ({ onNavigate }) => {
  const [dentists, setDentists] = useState<Dentist[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDentist, setSelectedDentist] = useState<string>('');
  
  const [newSchedule, setNewSchedule] = useState({
    dayOfWeek: 'Monday',
    startTime: '09:00',
    endTime: '17:00'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [d, s] = await Promise.all([getDentists(), getSchedules()]);
      setDentists(d);
      setSchedules(s);
      if (d.length > 0) setSelectedDentist(d[0].id);
    } catch (error) {
      console.error('Failed to load schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDentist) return;
    try {
      await saveSchedule({ ...newSchedule, dentistId: selectedDentist });
      loadData();
    } catch (err) {
      console.error('Failed to save schedule:', err);
      alert('Failed to save schedule. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSchedule(id);
      loadData();
    } catch (err) {
      console.error('Failed to delete schedule:', err);
      alert('Failed to delete schedule. Please try again.');
    }
  };

  if (loading) return <div className="p-20 text-center">Loading Schedules...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Staff Schedules</h1>
          <p className="text-gray-500 text-sm sm:text-base">Configure weekly availability for each specialist.</p>
        </div>
        <button onClick={() => onNavigate('dashboard')} className="text-blue-600 font-bold hover:underline self-start sm:self-center">Back to Admin Panel</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Add Schedule Form */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm h-fit">
          <h2 className="text-lg font-bold mb-6 text-gray-900">Assign New Working Hours</h2>
          <form onSubmit={handleAddSchedule} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Dentist</label>
              <select 
                className="w-full p-3 border rounded-xl bg-gray-50 text-sm"
                value={selectedDentist}
                onChange={(e) => setSelectedDentist(e.target.value)}
              >
                {dentists.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Day</label>
              <select 
                className="w-full p-3 border rounded-xl bg-gray-50 text-sm"
                value={newSchedule.dayOfWeek}
                onChange={(e) => setNewSchedule({...newSchedule, dayOfWeek: e.target.value})}
              >
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => <option key={day} value={day}>{day}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Start</label>
                <input 
                  type="time" className="w-full p-3 border rounded-xl bg-gray-50 text-sm"
                  value={newSchedule.startTime}
                  onChange={(e) => setNewSchedule({...newSchedule, startTime: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">End</label>
                <input 
                  type="time" className="w-full p-3 border rounded-xl bg-gray-50 text-sm"
                  value={newSchedule.endTime}
                  onChange={(e) => setNewSchedule({...newSchedule, endTime: e.target.value})}
                />
              </div>
            </div>
            <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition mt-4">
              Save Weekly Schedule
            </button>
          </form>
        </div>

        {/* Schedule List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Current Availability Table</h2>
          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
              <thead>
                <tr className="bg-gray-50 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                  <th className="px-6 py-4">Specialist</th>
                  <th className="px-6 py-4">Work Day</th>
                  <th className="px-6 py-4">Shift</th>
                  <th className="px-6 py-4 text-right">Remove</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {schedules.map(s => {
                  const doc = dentists.find(d => d.id === s.dentistId);
                  return (
                    <tr key={s.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={doc?.imageUrl || 'https://picsum.photos/seed/doc/200'} className="w-8 h-8 rounded-full" alt="" />
                          <span className="font-bold text-gray-900 text-sm">{doc?.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-600">{s.dayOfWeek}</td>
                      <td className="px-6 py-4">
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-md font-bold">
                          {s.startTime} - {s.endTime}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => handleDelete(s.id)} className="text-red-400 hover:text-red-600 p-1">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {schedules.length === 0 && <div className="p-20 text-center text-gray-400 italic">No shifts assigned yet.</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageSchedules;
