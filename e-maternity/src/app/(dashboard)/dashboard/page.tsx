// app/(dashboard)/dashboard/page.tsx
'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Icons } from '@/components/icons';

export default function DashboardPage() {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && role) {
      // Redirect to role-specific dashboard
      switch (role) {
        case 'MOTHER':
          router.replace('/dashboard/mother');
          break;
        case 'DOCTOR':
          router.replace('/dashboard/doctor');
          break;
        case 'MIDWIFE':
          router.replace('/dashboard/midwife');
          break;
        case 'PHI':
          router.replace('/dashboard/phi');
          break;
        case 'ADMIN':
          router.replace('/dashboard/admin');
          break;
        default:
          router.replace('/');
      }
    }
  }, [role, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Icons.Loader2 className="w-8 h-8 animate-spin text-[#E91E63]" />
      </div>
    );
  }

  return null;
}
