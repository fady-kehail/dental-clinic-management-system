import React, { useEffect, useState } from 'react';
import { useAuth } from '../App';
import { getAppointments, updateAppointmentDetails } from '../services/Api';
import { Appointment, AppointmentStatus } from '../types';

interface DentistDashboardProps {
  onNavigate: (page: string, params?: any) => void;
}

const DentistDashboard: React.FC<DentistDashboardProps> = ({ onNavigate }) => {
  const { auth } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ status: string; notes: string }>({ status: '', notes: '' });

  useEffect(() => {
    fetchAppointments();
  }, [auth.user]);

  const fetchAppointments = async () => {
    try {
      if (auth.user) {
        const data = await getAppointments();
        setAppointments(data);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (app: Appointment) => {
    setEditingId(app.id);
    setEditForm({ status: app.status, notes: app.notes || '' });
  };

  const handleSave = async (id: string) => {
    try {
      await updateAppointmentDetails(id, {
        status: editForm.status,
        notes: editForm.notes
      });
      setEditingId(null);
      fetchAppointments();
    } catch (error) {
      console.error('Error updating appointment:', error);
      alert('Failed to update appointment.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case AppointmentStatus.CONFIRMED: return 'text-green-600 bg-green-50';
      case AppointmentStatus.PENDING: return 'text-amber-600 bg-amber-50';
      case AppointmentStatus.CANCELLED:
      case 'CANCELED': return 'text-red-600 bg-red-50';
      case AppointmentStatus.COMPLETED: return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Dr. {auth.user?.name}
          </h1>
          <p className="text-gray-500 mt-1">
            Manage your patient appointments.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : appointments.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <ul className="divide-y divide-gray-100">
            {appointments.map((app) => (
              <li key={app.id} className="p-4 sm:p-6 hover:bg-gray-50 transition">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <p className="font-bold text-lg text-gray-900">{app.patientName || 'Unknown Patient'}</p>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${getStatusColor(app.status)}`}>
                        {app.status}
                      </span>
                    </div>
                    <p className="text-gray-600 flex items-center gap-2 text-sm sm:text-base">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                       </svg>
                       {new Date(app.dateTime).toLocaleString()}
                    </p>
                    {app.notes && (
                        <p className="text-sm text-gray-500 mt-2 italic break-words">
                            Notes: {app.notes}
                        </p>
                    )}
                  </div>

                  <div className="flex items-start w-full sm:w-auto mt-2 sm:mt-0">
                      {editingId === app.id ? (
                          <div className="flex flex-col gap-2 w-full sm:w-64 bg-gray-50 p-3 rounded-lg border border-gray-200">
                              <select 
                                value={editForm.status} 
                                onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                                className="border rounded px-2 py-2 text-sm bg-white"
                              >
                                  <option value="PENDING">Pending</option>
                                  <option value="CONFIRMED">Confirmed</option>
                                  <option value="COMPLETED">Completed</option>
                                  <option value="CANCELLED">Cancelled</option>
                              </select>
                              <textarea 
                                value={editForm.notes} 
                                onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                                placeholder="Add notes..."
                                className="border rounded px-2 py-2 text-sm h-20 w-full"
                              />
                              <div className="flex gap-2">
                                  <button onClick={() => handleSave(app.id)} className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 font-medium">Save</button>
                                  <button onClick={() => setEditingId(null)} className="flex-1 bg-gray-200 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-300 font-medium">Cancel</button>
                              </div>
                          </div>
                      ) : (
                        <button
                          onClick={() => handleEditClick(app)}
                          className="w-full sm:w-auto text-blue-600 font-semibold text-sm hover:underline border sm:border-none p-2 sm:p-0 rounded text-center"
                        >
                          Update Status/Notes
                        </button>
                      )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
          <p className="text-gray-400 mb-4">
            You have no appointments scheduled.
          </p>
        </div>
      )}
    </div>
  );
};

export default DentistDashboard;
