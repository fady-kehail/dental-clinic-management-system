
import React from 'react';
import { useAuth } from '../App';
import { UserRole } from '../types';

interface NavbarProps {
  onNavigate: (page: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate }) => {
  const { auth, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <button 
              onClick={() => onNavigate('home')}
              className="flex items-center space-x-2 text-blue-600 font-bold text-xl"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>BrightSmile</span>
            </button>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {auth.isAuthenticated ? (
              <>
                <button 
                  onClick={() => onNavigate('dashboard')}
                  className="text-gray-600 hover:text-blue-600 font-medium px-3 py-2 rounded-md transition"
                >
                  Dashboard
                </button>
                {auth.user?.role === UserRole.ADMIN && (
                  <>
                    <button 
                      onClick={() => onNavigate('manage-dentists')}
                      className="text-gray-600 hover:text-blue-600 font-medium px-3 py-2 rounded-md transition"
                    >
                      Manage Dentists
                    </button>
                    <button 
                      onClick={() => onNavigate('manage-schedules')}
                      className="text-gray-600 hover:text-blue-600 font-medium px-3 py-2 rounded-md transition"
                    >
                      Manage Schedules
                    </button>
                  </>
                )}
                <div className="h-8 w-px bg-gray-200"></div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-semibold text-gray-700 hidden lg:inline">
                    {auth.user?.name}
                  </span>
                  <button 
                    onClick={logout}
                    className="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg text-sm font-medium transition"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <button 
                  onClick={() => onNavigate('login')}
                  className="text-gray-600 hover:text-blue-600 font-medium px-3 py-2"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => onNavigate('register')}
                  className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700 transition shadow-md shadow-blue-200"
                >
                  Register
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">Open main menu</span>
              {!isMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white shadow-lg">
            {auth.isAuthenticated ? (
              <>
                <div className="px-3 py-2 text-base font-medium text-gray-500 border-b border-gray-100 mb-2">
                  Signed in as <span className="text-gray-900 font-bold">{auth.user?.name}</span>
                </div>
                <button 
                  onClick={() => { onNavigate('dashboard'); setIsMenuOpen(false); }}
                  className="block w-full text-left px-3 py-4 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                >
                  Dashboard
                </button>
                {auth.user?.role === UserRole.ADMIN && (
                  <>
                    <button 
                      onClick={() => { onNavigate('manage-dentists'); setIsMenuOpen(false); }}
                      className="block w-full text-left px-3 py-4 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                    >
                      Manage Dentists
                    </button>
                    <button 
                      onClick={() => { onNavigate('manage-schedules'); setIsMenuOpen(false); }}
                      className="block w-full text-left px-3 py-4 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                    >
                      Manage Schedules
                    </button>
                  </>
                )}
                <button 
                  onClick={() => { logout(); setIsMenuOpen(false); }}
                  className="block w-full text-left px-3 py-4 mt-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => { onNavigate('login'); setIsMenuOpen(false); }}
                  className="block w-full text-left px-3 py-4 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => { onNavigate('register'); setIsMenuOpen(false); }}
                  className="block w-full text-left px-3 py-4 mt-2 rounded-md text-base font-medium bg-blue-50 text-blue-600"
                >
                  Register
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
