
import React, { useEffect, useState } from 'react';
import { getAppointments, updateAppointmentStatus, resendConfirmationEmail } from '../services/Api';
import { Appointment, AppointmentStatus, UserRole } from '../types';

const AdminDashboard: React.FC<{onNavigate: (p: string) => void}> = ({onNavigate}) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await getAppointments();
      setAppointments(data);
    } catch (error) {
      console.error('Failed to load appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: AppointmentStatus) => {
    await  updateAppointmentStatus(id, status);
    fetchData();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clinic Management</h1>
          <p className="text-gray-500">Monitor and manage all clinic activities.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button 
            onClick={() => onNavigate('manage-dentists')}
            className="flex-1 sm:flex-none px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-medium text-center"
          >
            Manage Staff
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-bold text-gray-900">Recent Appointments</h2>
          <div className="flex gap-2">
            <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">Total: {appointments.length}</span>
          </div>
        </div>
        
        {loading ? (
          <div className="p-12 text-center text-gray-400">Loading appointments...</div>
        ) : appointments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Patient</th>
                  <th className="px-6 py-4 font-semibold">Dentist</th>
                  <th className="px-6 py-4 font-semibold">Date & Time</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {appointments.map(app => (
                  <tr key={app.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-medium text-gray-900">{app.patientName}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {app.dentistName}
                      {app.emailSent && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          Email Sent
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {new Date(app.dateTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                        app.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : 
                        app.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {app.status === 'PENDING' && (
                          <button 
                            onClick={() => updateStatus(app.id, AppointmentStatus.CONFIRMED)}
                            className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                          >
                            Approve
                          </button>
                        )}
                        <button 
                          onClick={async () => {
                            try {
                              await resendConfirmationEmail(app.id);
                              alert('Email sent!');
                            } catch (e) {
                              alert('Failed to send email');
                            }
                          }}
                          className="text-xs border border-gray-300 text-gray-600 px-3 py-1 rounded hover:bg-gray-50"
                        >
                          Resend Email
                        </button>
                        {app.status !== 'CANCELLED' && app.status !== 'CANCELED' && (
                          <button 
                            onClick={() => updateStatus(app.id, AppointmentStatus.CANCELLED)}
                            className="text-xs border border-red-200 text-red-500 px-3 py-1 rounded hover:bg-red-50"
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-gray-400">No appointments recorded yet.</div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
