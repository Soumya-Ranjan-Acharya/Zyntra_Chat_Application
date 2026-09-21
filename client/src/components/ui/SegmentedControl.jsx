import React from 'react';

const SegmentedControl = ({ options = [], value, onChange, size = 'md' }) => {
  const pad = size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm';
  return (
    <div className="inline-flex items-center bg-[var(--color-bg-tertiary)] rounded-[var(--radius-md)] p-1 gap-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`${pad} rounded-lg font-medium transition-all duration-150 whitespace-nowrap ${
            value === opt.value
              ? 'bg-[var(--color-accent)] text-white shadow-sm'
              : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)]'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};

export default SegmentedControl;
