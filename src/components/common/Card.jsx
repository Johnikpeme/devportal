import React from 'react';
import { classNames } from '@/utils/helpers';

const Card = ({ 
  children, 
  className = '',
  padding = 'md',
  hover = false,
  ...props 
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };
  
  return (
    <div
      className={classNames(
        'bg-white rounded-xl border border-gray-200',
        paddingClasses[padding],
        hover && 'hover:shadow-lg transition-shadow cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;