import React from 'react';

const Toggle = ({ enabled, onChange, label, description }) => (
  <div className="flex items-center justify-between py-2">
    <div className="flex-1 mr-4">
      {label && <div className="text-sm font-medium text-[var(--color-text-primary)]">{label}</div>}
      {description && <div className="text-xs text-[var(--color-text-tertiary)] mt-0.5">{description}</div>}
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/40 focus:ring-offset-1 ${
        enabled ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-bg-active)]'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-[var(--color-bg-primary)] shadow-sm transition-transform duration-200 ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  </div>
);

export default Toggle;
