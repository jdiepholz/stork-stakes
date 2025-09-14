'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const userId = localStorage.getItem('userId');
    
    if (userId) {
      // User is authenticated, redirect to dashboard
      router.push('/dashboard');
    } else {
      // User is not authenticated, redirect to auth page
      router.push('/auth');
    }
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div>Redirecting...</div>
    </div>
  );
}
