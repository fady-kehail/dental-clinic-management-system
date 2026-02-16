
export enum UserRole {
  PATIENT = 'PATIENT',
  ADMIN = 'ADMIN',
  DENTIST = 'DENTIST'
}

export enum AppointmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  specialty?: string;
}

export interface Dentist {
  id: string;
  name: string;
  specialization: string;
  experience: number;
  imageUrl: string;
  bio: string;
}

export interface Schedule {
  id: string;
  dentistId: string;
  dayOfWeek: string;
  startTime: string; // e.g., "09:00"
  endTime: string;   // e.g., "17:00"
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName?: string;
  dentistId: string;
  dentistName?: string;
  dateTime: string;
  status: AppointmentStatus;
  notes?: string;
  emailSent?: boolean;
  emailSentAt?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}
