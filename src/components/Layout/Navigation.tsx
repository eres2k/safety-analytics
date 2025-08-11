import React from 'react';
import { NavLink } from 'react-router-dom';
import clsx from 'clsx';

const navItems = [
  { path: '/overview', label: 'Overview', icon: '📊' },
  { path: '/injury', label: 'Injury & Illness', icon: '🏥' },
  { path: '/nearmiss', label: 'Near Miss', icon: '⚠️' },
  { path: '/combined', label: 'Combined Analytics', icon: '📈' },
  { path: '/reports', label: 'Reports', icon: '📄' },
  { path: '/actions', label: 'Action Tracking', icon: '✅' },
];

export default function Navigation() {
  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md sticky top-20 z-40">
      <div className="container mx-auto px-4">
        <div className="flex gap-2 overflow-x-auto py-3">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-2 px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-all',
                  'hover:translate-y-[-2px] hover:shadow-lg',
                  isActive
                    ? 'bg-orange-500 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                )
              }
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
