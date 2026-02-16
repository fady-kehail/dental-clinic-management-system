
import React, { useState, useEffect, createContext, useContext } from 'react';
import { User, UserRole, AuthState } from './types';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PatientDashboard from './pages/PatientDashboard';
import DentistDashboard from './pages/DentistDashboard';
import AdminDashboard from './pages/AdminDashboard';
import BookAppointment from './pages/BookAppointment';
import ManageDentists from './pages/ManageDentists';
import ManageSchedules from './pages/ManageSchedules';

interface AuthContextType {
  auth: AuthState;
  login: (user: User, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

const App: React.FC = () => {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false
  });

  const [currentPage, setCurrentPage] = useState<string>('home');
  const [routeParams, setRouteParams] = useState<any>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setAuth({ user: JSON.parse(savedUser), token: savedToken, isAuthenticated: true });
    }
  }, []);

  const navigate = (page: string, params?: any) => {
    setCurrentPage(page);
    setRouteParams(params);
  };

  const login = (user: User, token: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setAuth({ user, token, isAuthenticated: true });
    navigate('dashboard');
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuth({ user: null, token: null, isAuthenticated: false });
    navigate('home');
  };

  const renderPage = () => {
    if (currentPage === 'home') return <LandingPage onAction={(p) => navigate(p)} />;
    if (currentPage === 'login') return <LoginPage onLogin={login} onNavigate={(p) => navigate(p)} />;
    if (currentPage === 'register') return <RegisterPage onNavigate={(p) => navigate(p)} />;

    if (!auth.isAuthenticated) return <LoginPage onLogin={login} onNavigate={(p) => navigate(p)} />;

    switch (currentPage) {
      case 'dashboard':
        if (auth.user?.role === UserRole.ADMIN) return <AdminDashboard onNavigate={navigate} />;
        if (auth.user?.role === UserRole.DENTIST) return <DentistDashboard onNavigate={navigate} />;
        return <PatientDashboard onNavigate={navigate} />;
      case 'book':
        return <BookAppointment onNavigate={navigate} editId={routeParams?.id} />;
      case 'manage-dentists':
        return auth.user?.role === UserRole.ADMIN ? <ManageDentists onNavigate={navigate} /> : <LandingPage onAction={(p) => navigate(p)} />;
      case 'manage-schedules':
        return auth.user?.role === UserRole.ADMIN ? <ManageSchedules onNavigate={navigate} /> : <LandingPage onAction={(p) => navigate(p)} />;
      default:
        return <LandingPage onAction={(p) => navigate(p)} />;
    }
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      <div className="min-h-screen flex flex-col">
        <Navbar onNavigate={navigate} />
        <main className="flex-grow">
          {renderPage()}
        </main>
        <footer className="bg-white border-t py-6 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} BrightSmile Dental Clinic. All rights reserved.
        </footer>
      </div>
    </AuthContext.Provider>
  );
};

export default App;
