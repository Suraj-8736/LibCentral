import React from 'react';
import { getStatusBadgeStyle } from '../../utils/formatters';

const Badge = ({
  children,
  status,
  variant = 'default',
  size = 'md',
  dot = false,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  const statusClass = status ? getStatusBadgeStyle(status) : '';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border ${sizeClasses[size]} ${statusClass} ${className}`}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      <span className="capitalize">{children || status}</span>
    </span>
  );
};

export default Badge;
