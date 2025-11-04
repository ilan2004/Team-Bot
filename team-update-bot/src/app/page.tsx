'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    // Check if this is a PWA launch or regular web visit
    const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
                  (window.navigator as any).standalone ||
                  document.referrer.includes('android-app://');
    
    // Small delay to ensure PWA detection works properly
    const timer = setTimeout(() => {
      router.push('/dashboard');
    }, isPWA ? 100 : 0);

    return () => clearTimeout(timer);
  }, [router]);

  // Show a loading state while redirecting
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="text-sm text-muted-foreground">Loading Team Update Bot...</p>
      </div>
    </div>
  );
}
