import { CheckSquare } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 px-4">
      <div className="mb-8 flex items-center gap-2 text-xl font-semibold text-white">
        <CheckSquare className="h-6 w-6 text-blue-600" />
        Standup Tracker
      </div>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
