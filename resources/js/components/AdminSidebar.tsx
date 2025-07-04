import React from 'react';
import { router } from '@inertiajs/react';
import { CreditCard, BarChart3, Settings, LogOut, Users, LucideIcon } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Link, usePage } from '@inertiajs/react';

// Declare the global route function (Laravel Ziggy)
declare global {
  function route(name: string, params?: any): string;
}

// Type definitions for Inertia and Sidebar hooks
interface SidebarContextType {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

interface PageProps {
  [key: string]: any;
}

interface InertiaPage {
  url: string;
  component: string;
  props: PageProps;
  version: string | null;
}

interface MenuItem {
  title: string;
  url: string;
  icon: LucideIcon;
  badge?: string;
}

const items: MenuItem[] = [
  {
    title: "Gerenciador de usuários",
    url: "/admin/users",
    icon: Users,
    badge: "New" // optional
  },
  { title: 'Cartões', url: '/dashboard', icon: CreditCard },
  { title: 'Pagamentos', url: '/admin/payments', icon: CreditCard },
  { title: 'Análise', url: '/admin/analytics', icon: BarChart3 },
  { title: 'Configurações', url: '/settings', icon: Settings },
];

export function AdminSidebar(): JSX.Element {
  const { collapsed }: SidebarContextType = useSidebar();
  const { url }: InertiaPage = usePage();

  const isActive = (path: string): boolean => url.startsWith(path);
  const isExpanded: boolean = items.some((i) => isActive(i.url));

  const getNavCls = (active: boolean): string =>
    active
      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium shadow'
      : 'hover:bg-muted/50';

  const handleLogout = (): void => {
    router.post(route('logout'));
  };

  return (
    <Sidebar className={collapsed ? 'w-14' : 'w-60'} collapsible>
      <SidebarTrigger className="m-2 self-end" />

      <SidebarContent>
        <div className="relative rounded-2xl flex items-center justify-center py-6 px-4 bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] border-b border-zinc-700 shadow-inner">
          <div className="relative w-full">
            <img
              src="/images/capinha-logo.png"
              alt="Capinha Digital"
              className={`mx-auto transition-all duration-500 relative rounded-[5px] ${collapsed ? 'h-10' : 'h-20'
                } object-contain drop-shadow-md`}
            />
            {!collapsed && (
              <p className="text-[0.65rem] text-center text-zinc-300 mt-2 tracking-wide italic font-light">
                Com você, para você, para todos.
              </p>
            )}
          </div>
        </div>

        <SidebarGroup open={isExpanded}>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item: MenuItem) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url} className={getNavCls(isActive(item.url))}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-auto p-4">
          <Button
            onClick={handleLogout}
            variant="outline"
            className={`${collapsed ? 'w-10 h-10 p-0' : 'w-full'} hover:bg-red-50 hover:text-red-600 hover:border-red-200`}
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span className="ml-2">Sair</span>}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}