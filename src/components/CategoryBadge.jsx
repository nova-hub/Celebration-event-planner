import React from 'react';
import { getCategoryMeta } from '../utils/helpers';

export default function CategoryBadge({ category, size = 'sm', className = '' }) {
  const meta = getCategoryMeta(category);

  const sizeClasses = {
    xs: 'px-2 py-0.5 text-xs',
    sm: 'px-2.5 py-1 text-xs font-medium',
    md: 'px-3 py-1.5 text-sm font-medium',
    lg: 'px-4 py-2 text-base font-semibold'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border shadow-sm transition-colors ${meta.badgeBg} ${sizeClasses[size] || sizeClasses.sm} ${className}`}
    >
      <span className="text-sm select-none">{meta.icon}</span>
      <span className="capitalize tracking-wide">{meta.label}</span>
    </span>
  );
}
