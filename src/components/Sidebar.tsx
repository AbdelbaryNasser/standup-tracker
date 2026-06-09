import { createClient } from '@/lib/supabase/server';
import { logout } from '@/lib/actions/auth';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { CheckSquare } from 'lucide-react';
import { SidebarNav } from './SidebarNav';

export async function Sidebar() {
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
    <aside className="fixed inset-y-0 left-0 z-40 flex w-56 flex-col border-r border-zinc-800 bg-zinc-950">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 px-5 border-b border-zinc-800">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600">
          <CheckSquare className="h-4 w-4 text-white" />
        </div>
        <span className="font-semibold text-white text-sm">Standup</span>
      </div>

      {/* Nav links */}
      <div className="flex flex-1 flex-col gap-1 overflow-y-auto py-4">
        <SidebarNav isManager={isManager} logoutAction={logout} />
      </div>

      {/* User profile */}
      {profile && (
        <div className="border-t border-zinc-800 px-4 py-4">
          <div className="flex items-center gap-3">
            <Avatar name={profile.full_name} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-zinc-200">{profile.full_name}</p>
              <Badge variant={isManager ? 'blue' : 'default'} className="mt-0.5">
                {isManager ? 'Manager' : 'Member'}
              </Badge>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
