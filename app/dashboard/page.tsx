'use client';

import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 mx-auto text-black mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const modules = [
    {
      name: 'Leads',
      description: 'Track and manage sales pipeline',
      icon: '📊',
      href: '/leads',
      color: 'from-blue-50 to-blue-100',
      textColor: 'text-blue-900',
    },
    {
      name: 'Policies',
      description: 'Manage insurance policies and coverage',
      icon: '📋',
      href: '/policies',
      color: 'from-green-50 to-green-100',
      textColor: 'text-green-900',
    },
    {
      name: 'Claims',
      description: 'Process and track insurance claims',
      icon: '⚙️',
      href: '/claims',
      color: 'from-purple-50 to-purple-100',
      textColor: 'text-purple-900',
    },
    {
      name: 'Contacts',
      description: 'Manage client relationships',
      icon: '👥',
      href: '/contacts',
      color: 'from-yellow-50 to-yellow-100',
      textColor: 'text-yellow-900',
    },
    {
      name: 'Insurance',
      description: 'Configure insurance products',
      icon: '🛡️',
      href: '/insurance',
      color: 'from-red-50 to-red-100',
      textColor: 'text-red-900',
    },
    {
      name: 'Reports',
      description: 'View analytics and insights',
      icon: '📈',
      href: '/reports',
      color: 'from-indigo-50 to-indigo-100',
      textColor: 'text-indigo-900',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div>
              <h1 className="text-3xl font-semibold text-black">DPA</h1>
              <p className="text-sm text-gray-600 mt-1">Insurance CRM Platform</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-black">{user?.email}</p>
                <p className="text-xs text-gray-600">
                  Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-900 transition-colors duration-200"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Welcome Section */}
        <div className="mb-16 animate-fadeInUp">
          <h2 className="text-4xl font-semibold text-black mb-4">
            Welcome back, {user?.email?.split('@')[0]}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl">
            Manage your insurance business with DPA. Access leads, policies, claims, and more from one place.
          </p>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module, index) => (
            <Link
              key={module.name}
              href={module.href}
              className={`group bg-gradient-to-br ${module.color} rounded-2xl p-8 transition-all duration-300 hover:shadow-lg hover:scale-105 animate-fadeInUp`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-4xl">{module.icon}</span>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <h3 className={`text-xl font-semibold ${module.textColor} mb-2`}>
                {module.name}
              </h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                {module.description}
              </p>
              <div className="mt-6 pt-4 border-t border-current border-opacity-20">
                <p className="text-xs font-medium text-gray-600 group-hover:text-black transition-colors">
                  Explore →
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* User Info Card */}
        <div className="mt-16 p-8 bg-gray-50 rounded-2xl border border-gray-200 animate-fadeInUp">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-black mb-4">Account Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wide">Email Address</p>
                  <p className="text-black font-medium mt-1">{user?.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wide">User ID</p>
                  <p className="text-black font-medium mt-1 font-mono text-sm">{user?.id}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wide">Member Since</p>
                  <p className="text-black font-medium mt-1">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
            <div className="hidden sm:block">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                {user?.email?.[0].toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
