import React, { useState } from 'react';
import { SubscriptionTier } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  onUpgradeClick: () => void;
  currentTier: SubscriptionTier;
  isPreviewing: boolean;
  onFinalizeUpgrade: () => void;
}

const Header: React.FC<HeaderProps> = ({ onUpgradeClick, currentTier, isPreviewing, onFinalizeUpgrade }) => {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  if (!user) return null;

  return (
    <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-20 border-b border-[#e1e3e5]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div/>
          <div className="flex items-center space-x-6">
            <div className="text-sm text-center">
              <span className="font-medium text-gray-600">Plan: </span>
              <span className="text-[#008060] font-semibold">{currentTier}</span>
              {isPreviewing && <span className="text-[#ffc107] ml-2 font-semibold">(Preview)</span>}
            </div>
            {isPreviewing ? (
                 <button
                 onClick={onFinalizeUpgrade}
                 className="px-4 py-2 text-sm font-semibold text-white bg-[#008060] rounded-md hover:bg-[#006e52] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#008060] transition-colors"
               >
                 Finalize Subscription
               </button>
            ) : (
                <button
                onClick={onUpgradeClick}
                className="px-4 py-2 text-sm font-semibold text-white bg-[#1a1a1a] rounded-md hover:bg-[#333333] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1a1a1a] transition-colors"
                >
                Upgrade
                </button>
            )}
            <div className="relative">
              <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center space-x-2">
                <img src={user.avatarUrl} alt={user.name} className="w-9 h-9 rounded-full" />
              </button>
              {isDropdownOpen && (
                <div 
                    className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-40"
                    onMouseLeave={() => setIsDropdownOpen(false)}
                >
                  <div className="py-1">
                    <div className="px-4 py-2 border-b border-[#e1e3e5]">
                      <p className="text-sm font-medium text-[#1a1a1a]">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        logout();
                      }}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;