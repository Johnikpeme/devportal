import React from 'react';
import { Menu, Search, Bell } from 'lucide-react';
import Button from '../common/Button';

const Header = ({ onMenuClick }) => {
  return (
    <header className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="px-4 py-3 flex items-center justify-between">
        <button 
          onClick={onMenuClick}
          className="text-gray-700 hover:text-gray-900"
        >
          <Menu className="w-6 h-6" />
        </button>
        
        <h1 className="font-bold text-gray-900">Dash Studios</h1>
        
        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-600 hover:text-gray-900">
            <Search className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-600 hover:text-gray-900 relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;