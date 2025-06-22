import React, { useEffect, useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from './AdminSidebar';
import { ToastProvider } from '@/components/ui/toast';
import ThemeToggle from './ThemeToggle';
import AnimatedBackground from './AnimatedBackground';
import { Button } from '@/components/ui/button';
import { Menu, X, Sun, Moon, Monitor } from 'lucide-react';

const AdminLayout = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isAdminLoggedIn');
    if (!isLoggedIn) {
      navigate('/admin/login');
    }
  }, [navigate]);

  // Initialize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' || 'system';
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (newTheme: 'light' | 'dark' | 'system') => {
    const root = window.document.documentElement;
    
    if (newTheme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.toggle('dark', systemTheme === 'dark');
    } else {
      root.classList.toggle('dark', newTheme === 'dark');
    }
  };

  const toggleTheme = () => {
    const themes: ('light' | 'dark' | 'system')[] = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    applyTheme(nextTheme);
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light': return <Sun className="h-4 w-4" />;
      case 'dark': return <Moon className="h-4 w-4" />;
      case 'system': return <Monitor className="h-4 w-4" />;
      default: return <Monitor className="h-4 w-4" />;
    }
  };

  const getThemeLabel = () => {
    switch (theme) {
      case 'light': return 'Claro';
      case 'dark': return 'Escuro';
      case 'system': return 'Sistema';
      default: return 'Sistema';
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <ToastProvider>
      <div className="min-h-screen relative bg-slate-50 dark:bg-[#020818] transition-colors duration-300">
        <AnimatedBackground />
        
        <SidebarProvider collapsedWidth={56}>
          <div className="flex min-h-screen w-full">
            {/* SIDEBAR */}
            <div className={`
              fixed lg:static inset-y-0 left-0 z-[90] w-64 lg:w-auto
              transform transition-transform duration-300 ease-in-out
              ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
              <AdminSidebar />
            </div>
            
            {/* MOBILE OVERLAY */}
            {sidebarOpen && (
              <div 
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[80] lg:hidden"
                onClick={() => setSidebarOpen(false)}
              />
            )}
            
            {/* MAIN CONTENT */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* ENHANCED HEADER - ALWAYS VISIBLE */}
              <header className="
                h-14 sm:h-16 border-b border-slate-200 dark:border-slate-700/50 
                bg-white dark:bg-slate-900 
                flex items-center justify-between px-4 sm:px-6 
                fixed top-0 left-0 right-0 z-[9999] shadow-sm
                relative
              ">
                {/* LEFT SIDE */}
                <div className="flex items-center gap-3 sm:gap-4">
                  {/* MOBILE MENU BUTTON - ALWAYS ACCESSIBLE */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleSidebar}
                    className="
                      lg:hidden p-2 
                      hover:bg-slate-100 dark:hover:bg-slate-800 
                      text-slate-700 dark:text-slate-300
                      pointer-events-auto cursor-pointer
                      touch-manipulation
                      !z-[99999] relative
                    "
                    aria-label="Alternar menu"
                    style={{ 
                      position: 'relative', 
                      zIndex: 99999,
                      isolation: 'isolate'
                    }}
                  >
                    {sidebarOpen ? (
                      <X className="h-5 w-5" />
                    ) : (
                      <Menu className="h-5 w-5" />
                    )}
                  </Button>

                  {/* DESKTOP SIDEBAR TRIGGER */}
                  <div 
                    className="hidden lg:block"
                    style={{ 
                      position: 'relative', 
                      zIndex: 99999,
                      isolation: 'isolate'
                    }}
                  >
                    <SidebarTrigger className="
                      p-2 hover:bg-slate-100 dark:hover:bg-slate-800 
                      text-slate-700 dark:text-slate-300
                      pointer-events-auto cursor-pointer
                      !z-[99999] relative
                    " />
                  </div>
                  
                  {/* BREADCRUMB/TITLE AREA */}
                  <div className="hidden sm:block">
                    <h1 className="text-lg font-semibold text-slate-900 dark:text-[#ae9efd]">
                      Painel Administrativo
                    </h1>
                  </div>
                </div>

                {/* RIGHT SIDE - ALWAYS VISIBLE CONTROLS */}
                <div 
                  className="flex items-center gap-2 sm:gap-3"
                  style={{ 
                    position: 'relative', 
                    zIndex: 99999,
                    isolation: 'isolate'
                  }}
                >
                  {/* THEME TOGGLE - ENHANCED */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleTheme}
                    className="
                      min-w-[2.5rem] sm:min-w-[auto] h-9 sm:h-10
                      bg-white dark:bg-slate-800 
                      border-slate-300 dark:border-slate-600 
                      text-slate-700 dark:text-slate-300 
                      hover:bg-slate-100 dark:hover:bg-slate-700
                      transition-all duration-200
                      shadow-sm hover:shadow-md
                      pointer-events-auto cursor-pointer
                      touch-manipulation
                      !z-[99999] relative
                    "
                    aria-label={`Tema atual: ${getThemeLabel()}`}
                    style={{ 
                      position: 'relative', 
                      zIndex: 99999,
                      isolation: 'isolate'
                    }}
                  >
                    <span className="flex items-center gap-2">
                      {getThemeIcon()}
                      <span className="hidden sm:inline text-sm font-medium">
                        {getThemeLabel()}
                      </span>
                    </span>
                  </Button>

                  {/* ADDITIONAL CONTROLS PLACEHOLDER */}
                  <div className="hidden md:flex items-center gap-2">
                    {/* Add more header controls here if needed */}
                  </div>
                </div>
              </header>
              
              {/* MAIN CONTENT AREA */}
              <main className="flex-1 bg-slate-50 dark:bg-[#020818] transition-colors duration-300 pt-14 sm:pt-16">
                <div className="w-full h-full relative z-[1]">
                  <Outlet />
                </div>
              </main>
            </div>
          </div>
        </SidebarProvider>

        {/* FLOATING QUICK ACTIONS - MOBILE */}
        <div 
          className="fixed bottom-6 right-6 lg:hidden"
          style={{ 
            zIndex: 99999,
            position: 'fixed'
          }}
        >
          <div className="flex flex-col gap-3">
            {/* Quick Theme Toggle */}
            <Button
              size="lg"
              onClick={toggleTheme}
              className="
                w-12 h-12 rounded-full shadow-lg hover:shadow-xl
                bg-white dark:bg-slate-800 
                border-2 border-slate-200 dark:border-slate-600
                text-slate-700 dark:text-slate-300
                hover:bg-slate-100 dark:hover:bg-slate-700
                transition-all duration-300
                pointer-events-auto cursor-pointer
                touch-manipulation
                !z-[99999]
              "
              aria-label={`Mudar tema: ${getThemeLabel()}`}
              style={{ 
                position: 'relative', 
                zIndex: 99999,
                isolation: 'isolate'
              }}
            >
              {getThemeIcon()}
            </Button>
          </div>
        </div>

        {/* RESPONSIVE BREADCRUMB BAR - MOBILE */}
        <div 
          className="sm:hidden fixed top-14 left-0 right-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700/50"
          style={{ zIndex: 9998 }}
        >
          <div className="px-4 py-2">
            <h2 className="text-sm font-medium text-slate-700 dark:text-[#ae9efd] truncate">
              Painel Administrativo
            </h2>
          </div>
        </div>
      </div>
    </ToastProvider>
  );
};

export default AdminLayout;