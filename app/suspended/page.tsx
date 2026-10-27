'use client';

// Where a suspended agency's non-admin users land (see axios-client.ts). Lives
// outside (protected) so the app shell, and its API calls, don't load here.
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { APP_NAME } from '@/lib/constants/brand';

export default function SuspendedPage() {
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center animate-fadeInUp">
        <h1 className="text-3xl font-semibold tracking-tight text-black mb-3">
          Your agency&apos;s account is paused
        </h1>
        <p className="text-base text-gray-600 mb-10">
          Your agency&apos;s billing needs attention. Ask your agency admin to update it in {APP_NAME}. Your
          data is safe.
        </p>

        <div className="space-y-3">
          {/* Once the admin has paid, this goes straight back in */}
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="w-full py-3 px-4 rounded-lg bg-black text-white font-medium text-base hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-all duration-200"
          >
            Try again
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full py-3 px-4 rounded-lg border border-gray-300 text-black font-medium text-base hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all duration-200"
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}
