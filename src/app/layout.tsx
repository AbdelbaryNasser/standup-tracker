import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Standup Tracker',
  description: 'Daily standup tracking for your team',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
