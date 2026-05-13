import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { logout } from '@/lib/actions/auth';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { LayoutDashboard, History, LogOut, CheckSquare, Users } from 'lucide-react';

export async function Navbar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single();

  const isManager = profile?.role === 'manager';

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-semibold text-white">
            <CheckSquare className="h-5 w-5 text-blue-500" />
            <span>Standup</span>
          </Link>

          <nav className="flex items-center gap-1">
            {!isManager && (
              <Link
                href="/standup"
                className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
              >
                <CheckSquare className="h-4 w-4" />
                My Standup
              </Link>
            )}
            <Link
              href="/history"
              className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
            >
              <History className="h-4 w-4" />
              History
            </Link>
            <Link
              href="/team"
              className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
            >
              <Users className="h-4 w-4" />
              Team
            </Link>
            {isManager && (
              <Link
                href="/manager"
                className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {profile && (
            <div className="flex items-center gap-2">
              <Avatar name={profile.full_name} size="sm" />
              <span className="hidden text-sm font-medium text-zinc-300 sm:block">
                {profile.full_name}
              </span>
              <Badge variant={isManager ? 'blue' : 'default'}>
                {isManager ? 'Manager' : 'Member'}
              </Badge>
            </div>
          )}

          <form action={logout}>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 transition-colors"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:block">Sign out</span>
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
