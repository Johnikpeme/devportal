import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { classNames } from '@/utils/helpers';

const Tabs = ({ tabs, defaultTab = 0 }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [showDropdown, setShowDropdown] = useState(false);
  
  return (
    <div>
      {/* Mobile Dropdown - Only visible on small screens */}
      <div className="sm:hidden border-b border-gray-200">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="w-full flex items-center justify-between py-4 px-4 text-left font-medium text-sm text-gray-900"
        >
          <span>{tabs[activeTab]?.label}</span>
          <ChevronDown className={`w-5 h-5 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
        </button>
        
        {showDropdown && (
          <div className="absolute z-10 w-full bg-white border border-gray-200 shadow-lg rounded-b-lg">
            {tabs.map((tab, index) => (
              <button
                key={index}
                onClick={() => {
                  setActiveTab(index);
                  setShowDropdown(false);
                }}
                className={classNames(
                  'w-full text-left py-3 px-4 hover:bg-gray-50 transition-colors',
                  activeTab === index ? 'bg-blue-50 text-primary font-medium' : 'text-gray-700'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Desktop Tabs - Hidden on small screens */}
      <div className="hidden sm:block border-b border-gray-200">
        <nav className="flex gap-8" aria-label="Tabs">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={classNames(
                'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                activeTab === index
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      
      {/* Tab Content */}
      <div className="py-6">
        {tabs[activeTab]?.content}
      </div>
    </div>
  );
};

export default Tabs;