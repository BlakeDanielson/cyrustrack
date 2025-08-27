'use client';

import React from 'react';
import { Cannabis, Plus, History, BarChart3, Settings, Menu, X } from 'lucide-react';
import { useConsumptionStore } from '@/store/consumption';
import { cn } from '@/lib/utils';

const Navigation: React.FC = () => {
  const { 
    activeView, 
    setActiveView, 
    showMobileMenu, 
    setMobileMenu 
  } = useConsumptionStore();

  const navigationItems = [
    { id: 'log', label: 'Log Session', icon: Plus },
    { id: 'history', label: 'History', icon: History },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  const handleNavClick = (view: typeof activeView) => {
    setActiveView(view);
    setMobileMenu(false);
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Cannabis className="h-8 w-8 text-green-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                Cannabis Tracker
              </span>
            </div>
            
            <div className="flex items-center space-x-8">
              {navigationItems.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => handleNavClick(id)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    activeView === id
                      ? "bg-green-100 text-green-700"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        {/* Mobile Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="px-4 sm:px-6">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Cannabis className="h-6 w-6 text-green-600" />
                <span className="ml-2 text-lg font-bold text-gray-900">
                  Cannabis Tracker
                </span>
              </div>
              
              <button
                onClick={() => setMobileMenu(!showMobileMenu)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                {showMobileMenu ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Mobile Menu Overlay */}
        {showMobileMenu && (
          <div className="fixed inset-0 z-40 bg-black bg-opacity-25 md:hidden">
            <div className="relative flex flex-col w-full max-w-xs bg-white h-full shadow-xl">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center">
                  <Cannabis className="h-6 w-6 text-green-600" />
                  <span className="ml-2 text-lg font-bold text-gray-900">
                    Cannabis Tracker
                  </span>
                </div>
              </div>
              
              <nav className="flex-1 px-4 py-6 space-y-2">
                {navigationItems.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => handleNavClick(id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-md text-left font-medium transition-colors",
                      activeView === id
                        ? "bg-green-100 text-green-700"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {label}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        )}

        {/* Mobile Bottom Navigation (Alternative) */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-40">
          <div className="grid grid-cols-4 h-16">
            {navigationItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => handleNavClick(id)}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors",
                  activeView === id
                    ? "text-green-600 bg-green-50"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="truncate">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navigation;
