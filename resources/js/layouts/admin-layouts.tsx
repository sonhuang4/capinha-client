// resources/js/layouts/AdminLayout.tsx

import { PropsWithChildren } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/AdminSidebar';
import ThemeToggle from '@/components/ThemeToggle';
import AnimatedBackground from '@/components/AnimatedBackground';

export default function AdminLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      
      <SidebarProvider >
        <div className="flex min-h-screen w-full">
          <AdminSidebar />

          <div className="flex-1 flex flex-col">
            <header className="h-16 border-b bg-card/80 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-10">
              <SidebarTrigger className="lg:hidden" />
              <div className="flex items-center gap-4">
                <ThemeToggle />
              </div>
            </header>

            <main className="flex-1 relative z-10 p-6">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
}
