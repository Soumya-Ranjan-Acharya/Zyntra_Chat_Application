import React from 'react';
import { ChevronRight } from 'lucide-react';

const Breadcrumb = ({ items = [] }) => (
  <nav className="flex items-center gap-1 text-sm overflow-x-auto scrollbar-hide">
    {items.map((item, i) => (
      <div key={i} className="flex items-center gap-1 shrink-0">
        {i > 0 && <ChevronRight size={14} className="text-[var(--color-text-tertiary)]" />}
        {i < items.length - 1 ? (
          <button
            onClick={item.onClick}
            className="text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors px-1 py-0.5 rounded hover:bg-[var(--color-bg-hover)]"
          >
            {item.label}
          </button>
        ) : (
          <span className="text-[var(--color-text-primary)] font-medium px-1 py-0.5">{item.label}</span>
        )}
      </div>
    ))}
  </nav>
);

export default Breadcrumb;
