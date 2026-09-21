import { useState, useRef, useEffect } from 'react';
import { Building2, ChevronDown, Check } from 'lucide-react';

const WorkspaceSwitcher = ({ workspaces = [], activeWorkspaceId, onSwitch }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const active = workspaces.find((ws) => ws.id === activeWorkspaceId);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
        <div className="w-9 h-9 rounded-lg bg-[var(--color-accent)]/20 flex items-center justify-center text-[var(--color-accent)]">
          <Building2 size={18} />
        </div>
        <div className="flex-1 text-left min-w-0">
          <div className="text-sm font-semibold text-white truncate">{active?.name || 'Workspace'}</div>
        </div>
        <ChevronDown size={16} className={`text-white/50 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute left-3 right-3 top-full mt-1 bg-slate-800 border border-white/10 rounded-xl shadow-xl overflow-hidden z-50">
          {workspaces.map((ws) => (
            <button
              key={ws.id}
              onClick={() => { onSwitch(ws); setOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
            >
              <Building2 size={16} className="text-white/60 shrink-0" />
              <span className="text-sm text-white/90 flex-1 truncate">{ws.name}</span>
              {ws.id === activeWorkspaceId && <Check size={16} className="text-[var(--color-accent)] shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
export default WorkspaceSwitcher;
