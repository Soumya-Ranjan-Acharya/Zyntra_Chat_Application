import React from 'react';
import { ChevronRight, Building2, Folder, MessageSquare } from 'lucide-react';

const WorkspaceBreadcrumb = ({ path = [], onNavigate }) => {
  if (!path || path.length === 0) return null;

  return (
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '12px',
        overflowX: 'auto',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        whiteSpace: 'nowrap',
        userSelect: 'none',
        padding: '2px 0'
      }}
    >
      {path.map((node, index) => {
        const isLast = index === path.length - 1;
        const isRoot = index === 0;

        return (
          <div key={node.id} className="flex items-center gap-1 shrink-0">
            {index > 0 && (
              <ChevronRight size={13} className="text-slate-400 shrink-0" />
            )}

            {isLast ? (
              <span className="font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded-md flex items-center gap-1">
                {isRoot ? (
                  <Building2 size={12} className="text-blue-600" />
                ) : (
                  <MessageSquare size={12} className="text-blue-600" />
                )}
                {node.name}
              </span>
            ) : (
              <button
                type="button"
                onClick={() => onNavigate && onNavigate(node.id)}
                className="text-slate-500 hover:text-blue-600 hover:bg-slate-100 px-1.5 py-0.5 rounded transition-colors font-medium cursor-pointer flex items-center gap-1"
              >
                {isRoot ? <Building2 size={11} /> : <Folder size={11} />}
                {node.name}
              </button>
            )}
          </div>
        );
      })}
    </nav>
  );
};

export default WorkspaceBreadcrumb;
