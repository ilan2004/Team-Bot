import AppSidebar from '@/components/layout/app-sidebar';
import Header from '@/components/layout/header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { PWAInstaller, PWAManifestUpdater } from '@/components/pwa/pwa-installer';
import type { Metadata, Viewport } from 'next';
import { cookies } from 'next/headers';

const META_THEME_COLORS = {
  light: '#ffffff',
  dark: '#09090b'
};

export const metadata: Metadata = {
  title: 'Team Dashboard - Dec 4 TestFlight Progress',
  description: 'Track team progress, tasks, and milestones for Nudge iOS app development',
  manifest: '/dashboard-manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Team Dashboard',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'Team Update Bot',
    title: 'Team Dashboard - Dec 4 TestFlight Progress',
    description: 'Track team progress, tasks, and milestones for Nudge iOS app development',
  },
  twitter: {
    card: 'summary',
    title: 'Team Dashboard - Dec 4 TestFlight Progress',
    description: 'Track team progress, tasks, and milestones for Nudge iOS app development',
  },
};

export const viewport: Viewport = {
  themeColor: META_THEME_COLORS.light
};

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  // Persisting the sidebar state in the cookie.
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true"
  return (
    <>
      <PWAManifestUpdater />
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar />
        <SidebarInset>
          <Header />
          {children}
        </SidebarInset>
        <PWAInstaller />
      </SidebarProvider>
    </>
  );
}
