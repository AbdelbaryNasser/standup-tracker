'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CheckSquare, History, Users, LayoutDashboard, LogOut } from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

interface SidebarNavProps {
  isManager: boolean;
  logoutAction: () => Promise<void>;
}

export function SidebarNav({ isManager, logoutAction }: SidebarNavProps) {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    ...(isManager
      ? [{ href: '/manager', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> }]
      : [{ href: '/standup', label: 'My Standup', icon: <CheckSquare className="h-4 w-4" /> }]),
    { href: '/team', label: 'Team', icon: <Users className="h-4 w-4" /> },
    { href: '/history', label: isManager ? 'Team History' : 'History', icon: <History className="h-4 w-4" /> },
  ];

  return (
    <nav className="flex flex-1 flex-col gap-1 px-3">
      {navItems.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + '/');
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              active
                ? 'bg-blue-600/20 text-blue-400'
                : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
            }`}
          >
            <span className={active ? 'text-blue-400' : 'text-zinc-500'}>{item.icon}</span>
            {item.label}
          </Link>
        );
      })}

      <div className="mt-auto pt-4 border-t border-zinc-800">
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </form>
      </div>
    </nav>
  );
}
