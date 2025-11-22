import React from 'react';
import { Home, Gamepad2, Wallet, User, ShieldCheck } from 'lucide-react';
import { useApp } from '../context';
import { Page } from '../types';

export const BottomNavigation: React.FC = () => {
  const { activePage, setPage, user } = useApp();

  const navItems = [
    { page: Page.HOME, icon: Home, label: 'Home' },
    { page: Page.EARN, icon: Gamepad2, label: 'Earn' },
    { page: Page.WALLET, icon: Wallet, label: 'Wallet' },
    { page: Page.PROFILE, icon: User, label: 'Profile' },
  ];

  if (user?.isAdmin) {
    navItems.push({ page: Page.ADMIN, icon: ShieldCheck, label: 'Admin' });
  }

  // Added extra padding bottom (pb-safe + 16 or similar) to account for Banner Ad
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe pt-2 pb-14 px-4 z-40">
      <div className="flex justify-between items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = activePage === item.page;
          const Icon = item.icon;
          return (
            <button
              key={item.page}
              onClick={() => setPage(item.page)}
              className={`flex flex-col items-center space-y-1 w-14 transition-colors ${
                isActive ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[10px] font-medium ${isActive ? 'text-indigo-600' : 'text-gray-500'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};