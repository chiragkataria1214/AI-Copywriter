import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

export const StationToggleButton = ({ 
  isOpen, 
  onClick, 
  title, 
  icon, 
  iconColor,
  description
}: { 
  isOpen: boolean; 
  onClick: () => void; 
  title: string; 
  icon: React.ReactNode; 
  iconColor: string;
  description: string;
}) => (
  <div className="bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200 border border-gray-200">
    <button
      onClick={onClick}
      className="flex items-center justify-between w-full p-4"
    >
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          {isOpen ? (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          )}
          <span className={iconColor}>{icon}</span>
        </div>
        <div className="text-left">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {!isOpen && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-xs text-gray-500 font-medium">
          {isOpen ? 'Collapse' : 'Expand'}
        </span>
      </div>
    </button>
  </div>
);
