
import React from 'react';

interface LandingPageProps {
  onAction: (page: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onAction }) => {
  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      {/* Hero Section */}
      <section className="relative pt-10 pb-16 lg:pt-32 lg:pb-40 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="text-center sm:max-w-2xl sm:mx-auto lg:col-span-6 lg:text-left">
              <span className="inline-block px-3 py-1 mb-6 text-sm font-semibold tracking-wide text-blue-600 uppercase bg-blue-100 rounded-full">
                Smile with Confidence
              </span>
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                Modern Dental Care for the <span className="text-blue-600 block sm:inline">Whole Family</span>
              </h1>
              <p className="mt-6 text-base text-gray-500 sm:text-xl md:text-lg lg:text-xl">
                Experience world-class dental services with our expert team of dentists. Easy online booking, transparent care, and a comfortable environment.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row sm:justify-center lg:justify-start gap-4">
                <button 
                  onClick={() => onAction('register')}
                  className="w-full sm:w-auto inline-flex justify-center items-center px-8 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transition md:py-4 md:text-lg md:px-10"
                >
                  Get Started
                </button>
                <button 
                  onClick={() => onAction('login')}
                  className="w-full sm:w-auto inline-flex justify-center items-center px-8 py-3 border border-gray-300 text-base font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition md:py-4 md:text-lg md:px-10"
                >
                  View Dentists
                </button>
              </div>
            </div>
            <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
              <div className="relative mx-auto w-full rounded-3xl shadow-2xl overflow-hidden">
                <img
                  className="w-full h-full object-cover"
                  src="https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=1200"
                  alt="Modern Dental Clinic"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900">Why Choose BrightSmile?</h2>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mx-auto mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              </div>
              <h3 className="text-xl font-bold mb-4">Easy Scheduling</h3>
              <p className="text-gray-500">Book, reschedule, or cancel appointments with just a few clicks anytime, anywhere.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mx-auto mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04c-.127.39-.191.812-.191 1.257 0 5.388 3.32 9.994 8 11.834 4.68-1.84 8-6.446 8-11.834 0-.445-.064-.867-.191-1.257z"></path></svg>
              </div>
              <h3 className="text-xl font-bold mb-4">Expert Dentists</h3>
              <p className="text-gray-500">Access top-rated specialists in Orthodontics, Periodontics, and General Dentistry.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mx-auto mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <h3 className="text-xl font-bold mb-4">Real-time Updates</h3>
              <p className="text-gray-500">Receive instant confirmation and status updates for all your dental appointments.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
