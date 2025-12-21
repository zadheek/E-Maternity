// hooks/useAuth.ts
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import type { UserRole } from '@prisma/client';

export function useAuth(requiredRole?: UserRole) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const loading = status === 'loading';

  useEffect(() => {
    if (!loading && !session) {
      router.push('/login');
    }

    if (
      !loading &&
      session &&
      requiredRole &&
      (session.user as any).role !== requiredRole &&
      (session.user as any).role !== 'ADMIN'
    ) {
      router.push('/unauthorized');
    }
  }, [session, loading, requiredRole, router]);

  return {
    user: session?.user,
    role: (session?.user as any)?.role as UserRole | undefined,
    loading,
    authenticated: !!session,
  };
}
