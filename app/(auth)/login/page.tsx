'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { APP_NAME } from '@/lib/constants/brand';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [localError, setLocalError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [lastChangeTime, setLastChangeTime] = useState(0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const now = Date.now();
    const wasEmpty = !formData[name as keyof typeof formData];
    const newFormData = { ...formData, [name]: value };

    setFormData(newFormData);
    if (localError) setLocalError(null);
    if (error) clearError();

    if (wasEmpty && value && newFormData.email && newFormData.password && now - lastChangeTime < 200) {
      setTimeout(() => handleAutoSubmit(newFormData), 100);
    }
    setLastChangeTime(now);
  };

  const handleAutoSubmit = async (data: typeof formData) => {
    try {
      await login(data);
      router.push('/dashboard');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setLocalError(message);
      setShake(true);
      setTimeout(() => setShake(false), 400);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLocalError(null);

    if (!formData.email || !formData.password) {
      setLocalError('Email and password are required');
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }

    try {
      await login(formData);
      router.push('/dashboard');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setLocalError(message);
      setShake(true);
      setTimeout(() => setShake(false), 400);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      {/* Animated gradient background */}
      <div className="absolute inset-0 -z-10 opacity-5">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-b from-blue-400 to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md animate-fadeInUp">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-semibold tracking-tight text-black mb-3">
            Sign in
          </h1>
          <p className="text-base text-gray-600">
            Welcome back to {APP_NAME}
          </p>
        </div>

        {/* Form */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Error Message with animation */}
          {(error || localError) && (
            <div className={`rounded-xl bg-red-50 border border-red-200 p-4 animate-slideInLeft ${shake ? 'animate-shake' : ''}`}>
              <p className="text-sm font-medium text-red-700">
                {error || localError}
              </p>
            </div>
          )}

          {/* Email Input */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 text-black placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200 bg-white"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </label>
              <Link href="#" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Forgot?
              </Link>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 text-black placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200 bg-white"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-lg bg-black text-white font-medium text-base hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </button>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-600">New to {APP_NAME}?</span>
            </div>
          </div>

          {/* Sign up link */}
          <Link
            href="/signup"
            className="w-full py-3 px-4 rounded-lg border border-gray-300 text-black font-medium text-base hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all duration-200 text-center block"
          >
            Create account
          </Link>
        </form>
      </div>
    </div>
  );
}
