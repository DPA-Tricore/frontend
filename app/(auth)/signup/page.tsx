'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { APP_NAME } from '@/lib/constants/brand';

export default function SignupPage() {
  const router = useRouter();
  const { signup, isLoading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Calculate password strength
    if (name === 'password') {
      let strength = 0;
      if (value.length >= 6) strength++;
      if (value.length >= 8) strength++;
      if (/[A-Z]/.test(value)) strength++;
      if (/[0-9]/.test(value)) strength++;
      setPasswordStrength(strength);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (localError) setLocalError(null);
    if (error) clearError();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLocalError(null);
    setSuccessMessage(null);

    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setLocalError('All fields are required');
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setLocalError('Passwords do not match');
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }

    if (formData.password.length < 6) {
      setLocalError('Password must be at least 6 characters long');
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }

    try {
      await signup({
        email: formData.email,
        password: formData.password,
      });
      setSuccessMessage('Account created successfully! Redirecting to login...');
      setFormData({ email: '', password: '', confirmPassword: '' });
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Signup failed';
      setLocalError(message);
      setShake(true);
      setTimeout(() => setShake(false), 400);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      {/* Animated gradient background */}
      <div className="absolute inset-0 -z-10 opacity-5">
        <div className="absolute top-0 right-1/2 translate-x-1/2 w-96 h-96 bg-gradient-to-b from-green-400 to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md animate-fadeInUp">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-semibold tracking-tight text-black mb-3">
            Create account
          </h1>
          <p className="text-base text-gray-600">
            Join {APP_NAME} and start managing your insurance business
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

          {/* Success Message */}
          {successMessage && (
            <div className="rounded-xl bg-green-50 border border-green-200 p-4 animate-slideInLeft">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-sm font-medium text-green-700">
                  {successMessage}
                </p>
              </div>
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
              className="w-full px-4 py-3 rounded-lg border border-gray-300 text-black placeholder-gray-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 transition-all duration-200 bg-white"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 text-black placeholder-gray-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 transition-all duration-200 bg-white"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
            />
            
            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1 bg-gray-300 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      passwordStrength === 0 ? 'w-0' :
                      passwordStrength === 1 ? 'w-1/3 bg-red-500' :
                      passwordStrength === 2 ? 'w-2/3 bg-yellow-500' :
                      'w-full bg-green-500'
                    }`}
                  ></div>
                </div>
                <span className="text-xs text-gray-600">
                  {passwordStrength === 0 ? 'Weak' :
                   passwordStrength === 1 ? 'Fair' :
                   passwordStrength === 2 ? 'Good' :
                   'Strong'}
                </span>
              </div>
            )}
          </div>

          {/* Confirm Password Input */}
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 text-black placeholder-gray-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 transition-all duration-200 bg-white"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={isLoading}
            />
            {formData.password && formData.confirmPassword && (
              <p className={`text-sm font-medium ${formData.password === formData.confirmPassword ? 'text-green-600' : 'text-red-600'}`}>
                {formData.password === formData.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
              </p>
            )}
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
                Creating account...
              </>
            ) : (
              'Create account'
            )}
          </button>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-600">Already have an account?</span>
            </div>
          </div>

          {/* Sign in link */}
          <Link
            href="/login"
            className="w-full py-3 px-4 rounded-lg border border-gray-300 text-black font-medium text-base hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all duration-200 text-center block"
          >
            Sign in
          </Link>
        </form>
      </div>
    </div>
  );
}
