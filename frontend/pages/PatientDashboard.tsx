import React, { useEffect, useState } from 'react';
import { useAuth } from '../App';
import { getAppointments, updateAppointmentStatus, resendConfirmationEmail } from '../services/Api';
import { Appointment, AppointmentStatus } from '../types';

interface PatientDashboardProps {
  onNavigate: (page: string, params?: any) => void;
}

const PatientDashboard: React.FC<PatientDashboardProps> = ({ onNavigate }) => {
  const { auth } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

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

  const handleCancel = async (id: string) => {
    if (confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await updateAppointmentStatus(id, AppointmentStatus.CANCELLED); 
        fetchAppointments();
      } catch (error) {
        console.error('Error cancelling appointment:', error);
      }
    }
  };

  const handleResendEmail = async (id: string) => {
    try {
      await resendConfirmationEmail(id);
      alert('Email confirmation sent!');
      fetchAppointments();
    } catch (error) {
      console.error('Error resending email:', error);
      alert('Failed to send email. Please try again.');
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Welcome, {auth.user?.name}
          </h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">
            Manage your dental care and upcoming appointments.
          </p>
        </div>

        <button
          onClick={() => onNavigate('book')}
          className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition"
        >
          Book Appointment
        </button>
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
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1 sm:mb-0">
                      <p className="font-bold text-gray-900">{app.dentistName}</p>
                      {app.emailSent && (
                        <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full" title={`Sent at ${new Date(app.emailSentAt || '').toLocaleString()}`}>
                          Email Sent
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(app.dateTime).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mt-2 sm:mt-0">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(app.status)}`}>
                      {app.status}
                    </span>

                    {(app.status === AppointmentStatus.PENDING || app.status === 'PENDING' || app.status === AppointmentStatus.CONFIRMED || app.status === 'CONFIRMED') && (
                      <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                        <button
                          onClick={() => handleResendEmail(app.id)}
                          className="flex-1 sm:flex-none text-blue-600 text-sm font-semibold hover:underline border sm:border-none p-2 sm:p-0 rounded text-center"
                        >
                          Resend Email
                        </button>
                        {(app.status !== AppointmentStatus.CONFIRMED && app.status !== 'CONFIRMED') && (
                          <button
                            onClick={() => onNavigate('book', { id: app.id })}
                            className="flex-1 sm:flex-none text-blue-600 text-sm font-semibold border sm:border-none p-2 sm:p-0 rounded text-center"
                          >
                            Reschedule
                          </button>
                        )}
                        <button
                          onClick={() => handleCancel(app.id)}
                          className="flex-1 sm:flex-none text-red-600 text-sm font-semibold border sm:border-none p-2 sm:p-0 rounded text-center"
                        >
                          Cancel
                        </button>
                      </div>
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
            You have no upcoming appointments.
          </p>
          <button
            onClick={() => onNavigate('book')}
            className="text-blue-600 font-bold hover:underline"
          >
            Book your first visit today!
          </button>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;
