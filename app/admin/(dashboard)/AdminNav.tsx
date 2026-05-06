'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface Session { email: string; role: string }

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/providers', label: 'Providers', icon: '🏥' },
  { href: '/admin/applications', label: 'Applications', icon: '📋' },
  { href: '/admin/reports', label: 'Reports', icon: '🚩' },
  { href: '/admin/audit', label: 'Audit Log', icon: '📝' },
];

export default function AdminNav({ session }: { session: Session }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/admin/login', { method: 'DELETE' });
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <aside className="w-56 bg-gray-900 border-r border-gray-800 flex flex-col shrink-0">
      <div className="p-4 border-b border-gray-800">
        <div className="text-white font-bold text-sm">🔬 PPF Admin</div>
        <div className="text-gray-400 text-xs mt-1">{session.email}</div>
        <div className="text-gray-500 text-xs capitalize">{session.role}</div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
              pathname === item.href
                ? 'bg-brand-700 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-3 border-t border-gray-800">
        <Link href="/" className="block text-xs text-gray-500 hover:text-gray-300 mb-2">
          ← View public site
        </Link>
        <button
          onClick={handleLogout}
          className="w-full text-left text-xs text-gray-500 hover:text-red-400 py-1"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
