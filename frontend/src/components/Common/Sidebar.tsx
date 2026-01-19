import React from 'react';
import Link from 'next/link';

interface SidebarProps {
  activePage: string;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { id: 'challenges', label: 'Challenges', href: '/challenges' },
    { id: 'leaderboard', label: 'Leaderboard', href: '/leaderboard' },
    { id: 'learning', label: 'Learning', href: '/learning' },
    { id: 'account', label: 'Account', href: '/account/billing' },
  ];

  return (
    <div className="w-64 bg-gray-800 border-r border-gray-700 min-h-screen">
      <div className="p-4">
        <h2 className="text-xl font-bold mb-6 text-center">TradeSense Quant</h2>
        <nav>
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={`flex items-center p-3 rounded-lg transition-colors ${
                    activePage === item.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;