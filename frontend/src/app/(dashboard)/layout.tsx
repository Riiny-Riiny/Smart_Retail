import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import PWAStatusBar from '@/components/layout/PWAStatusBar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PWAStatusBar />
      <Sidebar />
      <Header />
      <main className="lg:pl-64 pt-16">
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
} 