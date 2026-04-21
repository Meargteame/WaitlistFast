import React from 'react';
import { Zap, LayoutDashboard, Plus, CreditCard, LogOut } from 'lucide-react';
import { api } from '../lib/api';

interface SidebarProps {
  currentPage?: string;
}

export default function Sidebar({ currentPage = 'dashboard' }: SidebarProps) {
  async function handleLogout() {
    try {
      await api.auth.logout();
    } catch (error) {
      // Ignore errors, just redirect
    }
    window.location.href = '/';
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { id: 'create', label: 'Create Waitlist', icon: Plus, href: '/create' },
    { id: 'billing', label: 'Billing', icon: CreditCard, href: '/billing' },
  ];

  return (
    <div className="w-64 bg-white border-r border-zinc-200 h-screen fixed left-0 top-0 flex flex-col">
      <div className="p-6 border-b border-zinc-200">
        <a href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center shadow-lg shadow-zinc-200">
            <Zap className="text-white w-6 h-6 fill-current" />
          </div>
          <span className="text-xl font-bold tracking-tight">WaitlistFast</span>
        </a>
      </div>

      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <a
                key={item.id}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  isActive
                    ? 'bg-zinc-900 text-white'
                    : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </a>
            );
          })}
        </div>
      </nav>

      <div className="p-4 border-t border-zinc-200">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-zinc-600 hover:bg-red-50 hover:text-red-600 transition-all w-full"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );
}
