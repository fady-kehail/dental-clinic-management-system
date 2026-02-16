import axios from 'axios';
import { User, Dentist, Appointment, AppointmentStatus, Schedule } from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
  // headers: { 'Content-Type': 'application/json' }, // Removed: Let axios/browser handle it
});

// Axios interceptor: attach auth token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // No manual Content-Type setting; rely on Axios defaults
  
  return config;
});

// Axios interceptor: handle 401 globally (optional - for auto-logout on token expiry)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      // Could dispatch a global auth event here for App.tsx to handle logout
    }
    return Promise.reject(err);
  }
);

// ================= AUTH =================

export const login = async (email: string, password: string) => {
  const res = await api.post('/auth/login', { email, password });
  if (res.data.token) {
    localStorage.setItem('token', res.data.token);
  }
  return res.data;
};

export const register = async (userData: {
  name: string;
  email: string;
  password: string;
}) => {
  const res = await api.post('/auth/register', userData);
  return res.data;
};

// ================= DENTISTS =================

export const getDentists = async (): Promise<Dentist[]> => {
  const res = await api.get('/dentists');
  return res.data;
};

export const addDentist = async (dentist: any) => {
  const res = await api.post('/dentists', dentist);
  return res.data;
};

export const deleteDentist = async (id: string) => {
  await api.delete(`/dentists/${id}`);
};

// ================= APPOINTMENTS =================

export const getAppointments = async () => {
  const res = await api.get('/appointments');
  return res.data.data;
};

export const bookAppointment = async (appointment: any) => {
  const res = await api.post('/appointments', appointment);
  return res.data;
};

export const updateAppointmentDetails = async (id: string, data: { dateTime?: string; status?: string; notes?: string }) => {
  const res = await api.patch(`/appointments/${id}`, data);
  return res.data;
};

export const updateAppointment = async (id: string, dateTime: string) => {
  const res = await api.patch(`/appointments/${id}`, { dateTime });
  return res.data;
};

export const updateAppointmentStatus = async (
  id: string,
  status: AppointmentStatus
) => {
  await api.patch(`/appointments/${id}/status`, { status });
};

export const resendConfirmationEmail = async (id: string) => {
  const res = await api.post(`/appointments/${id}/resend`);
  return res.data;
};

// ================= SCHEDULES =================

export const getSchedules = async (dentistId?: string) => {
  const res = await api.get('/dentists/schedules', {
    params: { dentistId }
  });
  return res.data;
};

export const saveSchedule = async (schedule: Omit<Schedule, 'id'>) => {
  const res = await api.post('/dentists/schedules', schedule);
  return res.data;
};

export const deleteSchedule = async (id: string) => {
  await api.delete(`/dentists/schedules/${id}`);
};
