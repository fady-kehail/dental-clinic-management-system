
import React, { useState } from 'react';
import { register } from '../services/Api';

interface RegisterPageProps {
  onNavigate: (page: string) => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await register(formData);
      setSuccess(true);
      setTimeout(() => onNavigate('login'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Registration failed");
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-32 bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md border border-gray-100">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Created!</h2>
          <p className="text-gray-500">Redirecting you to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full flex items-center justify-center py-6 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-md w-full space-y-8 bg-white p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-100">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Create patient account</h2>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm">{error}</div>}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text" required
                className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email" required
                className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password" required
                className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>
          <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition">
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
