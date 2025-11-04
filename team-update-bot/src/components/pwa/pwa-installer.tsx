'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches || 
        (window.navigator as any).standalone) {
      setShowInstallButton(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowInstallButton(false);
    }
  };

  if (!showInstallButton) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        onClick={handleInstallClick}
        className="shadow-lg"
        size="sm"
      >
        <Download className="h-4 w-4 mr-2" />
        Install App
      </Button>
    </div>
  );
}

// Component to update manifest dynamically based on current path
export function PWAManifestUpdater() {
  useEffect(() => {
    const currentPath = window.location.pathname;
    const existingManifest = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;
    
    if (currentPath.startsWith('/dashboard')) {
      // Update manifest to dashboard version if on dashboard
      if (existingManifest) {
        existingManifest.href = '/dashboard-manifest.json';
      } else {
        const manifestLink = document.createElement('link');
        manifestLink.rel = 'manifest';
        manifestLink.href = '/dashboard-manifest.json';
        document.head.appendChild(manifestLink);
      }
    } else {
      // Use main manifest for other pages
      if (existingManifest) {
        existingManifest.href = '/manifest.json';
      }
    }
  }, []);

  return null;
}
