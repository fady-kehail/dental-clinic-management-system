import React, { useState } from 'react';
import { login } from '../services/Api';
import { User } from '../types';

interface LoginPageProps {
  onLogin: (user: User, token: string) => void;
  onNavigate: (page: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await login(email, password);
      // Ensure user object matches expected structure
      const user = { 
          id: response.id, 
          name: response.name, 
          email: response.email, 
          role: response.role,
          isDemo: response.isDemo || false // Handle isDemo flag
      };
      onLogin(user, response.token);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = (role: 'ADMIN' | 'DOCTOR' | 'PATIENT') => {
      switch(role) {
          case 'ADMIN':
              setEmail('demo.admin@clinic.com');
              setPassword('Demo123!');
              break;
          case 'DOCTOR':
              setEmail('demo.doctor@clinic.com');
              setPassword('Demo123!');
              break;
           case 'PATIENT':
              setEmail('demo.patient@clinic.com');
              setPassword('Demo123!');
              break;
      }
  };

  return (
    <div className="min-h-full flex items-center justify-center py-6 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-md w-full space-y-8 bg-white p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-100">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <button onClick={() => onNavigate('register')} className="font-medium text-blue-600 hover:text-blue-500">
              create a new patient account
            </button>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm border border-red-100">
              {error}
            </div>
          )}
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
              <input
                type="email"
                required
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                required
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg shadow-blue-200 transition disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
          
          {/* Demo Section */}
          <div className="pt-6 border-t border-gray-100">
             <div className="text-center mb-4">
               <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  Try the Demo
               </span>
             </div>
             <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                 <button
                    type="button"
                    onClick={() => fillDemoCredentials('ADMIN')}
                    className="flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-xs font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                 >
                   Admin
                 </button>
                 <button
                    type="button"
                    onClick={() => fillDemoCredentials('DOCTOR')}
                    className="flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-xs font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                 >
                   Doctor
                 </button>
                 <button
                    type="button"
                    onClick={() => fillDemoCredentials('PATIENT')}
                    className="flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-xs font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                 >
                   Patient
                 </button>
             </div>
             <p className="mt-3 text-center text-xs text-gray-400">
               Click to auto-fill demo credentials
             </p>
          </div>

        </form>
      </div>
    </div>
  );
};

export default LoginPage;
