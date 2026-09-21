import React from 'react';

const colors = {
  default: 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]',
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-red-100 text-red-700',
  accent: 'bg-[var(--color-accent-light)] text-[var(--color-accent)]',
};

const Badge = ({ children, variant = 'default', className = '' }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[variant]} ${className}`}>
    {children}
  </span>
);

export default Badge;
