import React from 'react';
import { DashboardIcon } from './icons/DashboardIcon';
import { PackageIcon } from './icons/PackageIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { BarChartIcon } from './icons/BarChartIcon';
import { Store } from '../types';
import { ClipboardListIcon } from './icons/ClipboardListIcon';

interface SidebarProps {
  store: Store;
  activePage: string;
  onNavigate: (page: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ store, activePage, onNavigate }) => {
  const navItems = [
    { name: 'Dashboard', icon: <DashboardIcon className="w-6 h-6" /> },
    { name: 'Products', icon: <PackageIcon className="w-6 h-6" /> },
    { name: 'Replenishment', icon: <ClipboardListIcon className="w-6 h-6" /> },
    { name: 'Analytics', icon: <BarChartIcon className="w-6 h-6" /> },
    { name: 'Settings', icon: <SettingsIcon className="w-6 h-6" /> },
  ];

  return (
    <aside className="fixed top-0 left-0 h-full w-16 md:w-64 bg-[#f7f7f7] border-r border-[#e1e3e5] z-30 flex flex-col">
      <div className="flex items-center justify-center md:justify-start md:px-6 h-16 border-b border-[#e1e3e5]">
        <div className="w-8 h-8 bg-[#008060] rounded-lg flex-shrink-0"></div>
        <div className="hidden md:block ml-3 overflow-hidden">
            <h1 className="text-lg font-bold text-[#1a1a1a] truncate">{store.name}</h1>
        </div>
      </div>
      <nav className="flex-1 py-6">
        <ul>
          {navItems.map(item => (
            <li key={item.name} className="px-3">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(item.name);
                }}
                className={`flex items-center justify-center md:justify-start p-3 my-1 rounded-lg transition-colors ${
                  activePage === item.name
                    ? 'bg-[#1a1a1a] text-white' 
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                {item.icon}
                <span className="hidden md:block ml-4 font-medium">{item.name}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;