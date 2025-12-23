import React from 'react';
import { classNames } from '@/utils/helpers';

const Input = ({ 
  label, 
  error, 
  helperText,
  icon: Icon,
  fullWidth = false,
  className = '',
  ...props 
}) => {
  const inputClasses = classNames(
    'px-4 py-2 border rounded-lg transition-all',
    'focus:ring-2 focus:ring-primary focus:border-transparent outline-none',
    error ? 'border-error focus:ring-error' : 'border-gray-300',
    Icon ? 'pl-10' : '',
    fullWidth ? 'w-full' : '',
    className
  );
  
  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
        <input className={inputClasses} {...props} />
      </div>
      {error && (
        <p className="mt-1 text-sm text-error">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

export default Input;