import { redirect } from 'next/navigation';
import { AuthService } from '@/services/auth';
import { Sidebar } from '@/components/dashboard/sidebar';
import { MobileNav } from '@/components/dashboard/mobile-nav';
import { logoutAction } from '@/actions/auth';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check authentication
  const authResult = await AuthService.checkAuth(['admin', 'moderator']);

  if (!authResult.authenticated) {
    redirect('/login');
  }

  if (!authResult.authorized) {
    redirect('/no-access');
  }

  const userRole = authResult.userRole as 'admin' | 'moderator';
  const username = authResult.userRole || 'User';

  async function handleLogout() {
    'use server';
    await logoutAction();
  }

  return (
    <div className="flex min-h-screen bg-[#FAFAFA]">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar
          userRole={userRole}
          username={username}
          onLogout={handleLogout}
        />
      </div>

      {/* Mobile Navigation */}
      <MobileNav
        userRole={userRole}
        username={username}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
