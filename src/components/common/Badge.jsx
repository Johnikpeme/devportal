import React from 'react';
import { classNames } from '@/utils/helpers';

const Badge = ({ 
  children, 
  variant = 'default',
  size = 'md',
  className = '' 
}) => {
  const variants = {
    default: 'bg-gray-100 text-gray-700',
    primary: 'bg-primary-50 text-primary',
    success: 'bg-success-light text-green-700',
    warning: 'bg-warning-light text-yellow-700',
    error: 'bg-error-light text-red-700',
    info: 'bg-info-light text-blue-700',
  };
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2 py-1 text-xs',
    lg: 'px-3 py-1 text-sm',
  };
  
  return (
    <span
      className={classNames(
        'inline-flex items-center font-medium rounded-full',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
};

export default Badge;