import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Building2, Check, Plus, Sparkles } from 'lucide-react';

const ContextDropdown = ({
  isOpen,
  setIsOpen,
  dropdownRef,
  mode,
  user,
  activeWorkspace,
  createdWorkspaces,
  joinedWorkspaces,
  handleSwitchContext,
  navigate,
  setCreateWsModalOpen
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="absolute top-[calc(100%+8px)] left-3 right-3 bg-[var(--color-bg-primary)] border border-[var(--color-border-primary)] rounded-[var(--radius-lg)] shadow-[var(--shadow-xl)] p-2.5 z-[100] max-h-[420px] overflow-y-auto custom-scrollbar"
        >
          {/* SECTION 1: PERSONAL SPACE */}
          <div className="py-1 px-2.5 text-[10px] font-bold text-[var(--color-text-tertiary)] tracking-widest uppercase">
            Personal Communication
          </div>

          <button
            type="button"
            onClick={() => handleSwitchContext('personal')}
            className={`w-full flex items-center justify-between p-2 rounded-[var(--radius-md)] border text-left cursor-pointer transition-colors mb-1.5 ${mode === 'personal' ? 'bg-[var(--color-bg-active)] border-[var(--color-border-focus)]' : 'bg-transparent border-transparent hover:bg-[var(--color-bg-hover)]'}`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`w-7 h-7 rounded-[var(--radius-sm)] flex items-center justify-center shrink-0 ${mode === 'personal' ? 'bg-[var(--color-accent)] text-white shadow-[0_2px_6px_rgba(var(--color-accent-rgb),0.35)]' : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] shadow-none'}`}>
                <User size={15} />
              </div>
              <div className="min-w-0">
                <div className="text-[12.5px] font-semibold text-[var(--color-text-primary)] whitespace-nowrap overflow-hidden text-ellipsis">
                  Personal Space
                </div>
                <div className="text-[10.5px] font-mono text-[var(--color-text-tertiary)]">
                  @{user?.primaryUsername || 'user'}.personal
                </div>
              </div>
            </div>
            {mode === 'personal' && (
              <Check size={15} className="text-[var(--color-accent)] shrink-0 ml-1.5" />
            )}
          </button>

          {/* SECTION 2: ORGANIZATIONS CREATED */}
          {createdWorkspaces.length > 0 && (
            <div className="mt-1.5 pt-1.5 border-t border-[var(--color-border-primary)]">
              <div className="py-1 px-2.5 text-[10px] font-bold text-[var(--color-text-tertiary)] tracking-widest uppercase">
                Organizations You Created
              </div>
              {createdWorkspaces.map((ws) => {
                const isActive = mode === 'workspace' && activeWorkspace?.id === ws.id;
                return (
                  <button
                    key={ws.id}
                    type="button"
                    onClick={() => handleSwitchContext('workplace', ws)}
                    className={`w-full flex items-center justify-between p-2 rounded-[var(--radius-md)] border text-left cursor-pointer transition-colors mb-1 ${isActive ? 'bg-[var(--color-bg-active)] border-[var(--color-border-focus)]' : 'bg-transparent border-transparent hover:bg-[var(--color-bg-hover)]'}`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-7 h-7 rounded-[var(--radius-sm)] flex items-center justify-center shrink-0 ${isActive ? 'bg-[var(--color-accent)] text-white shadow-[0_2px_6px_rgba(var(--color-accent-rgb),0.35)]' : 'bg-[var(--color-bg-secondary)] text-[var(--color-warning)] shadow-none'}`}>
                        <Building2 size={15} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[12.5px] font-semibold text-[var(--color-text-primary)] whitespace-nowrap overflow-hidden text-ellipsis">
                          {ws.name}
                        </div>
                        <div className="text-[10.5px] font-mono text-[var(--color-text-tertiary)]">
                          @{ws.contextualUsername || `${user?.primaryUsername || 'user'}.${ws.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 ml-1.5">
                      <span className="text-[9.5px] font-semibold px-1.5 py-px rounded bg-[rgba(var(--color-warning-rgb,245,158,11),0.15)] text-[var(--color-warning)] border border-[rgba(var(--color-warning-rgb,245,158,11),0.3)]">
                        Owner
                      </span>
                      {isActive && <Check size={15} className="text-[var(--color-accent)]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* SECTION 3: JOINED ORGANIZATIONS */}
          {joinedWorkspaces.length > 0 && (
            <div className="mt-1.5 pt-1.5 border-t border-[var(--color-border-primary)]">
              <div className="py-1 px-2.5 text-[10px] font-bold text-[var(--color-text-tertiary)] tracking-widest uppercase">
                Joined Organizations
              </div>
              {joinedWorkspaces.map((ws) => {
                const isActive = mode === 'workspace' && activeWorkspace?.id === ws.id;
                return (
                  <button
                    key={ws.id}
                    type="button"
                    onClick={() => handleSwitchContext('workplace', ws)}
                    className={`w-full flex items-center justify-between p-2 rounded-[var(--radius-md)] border text-left cursor-pointer transition-colors mb-1 ${isActive ? 'bg-[var(--color-bg-active)] border-[var(--color-border-focus)]' : 'bg-transparent border-transparent hover:bg-[var(--color-bg-hover)]'}`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-7 h-7 rounded-[var(--radius-sm)] flex items-center justify-center shrink-0 ${isActive ? 'bg-[var(--color-accent)] text-white shadow-[0_2px_6px_rgba(var(--color-accent-rgb),0.35)]' : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] shadow-none'}`}>
                        <Building2 size={15} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[12.5px] font-semibold text-[var(--color-text-primary)] whitespace-nowrap overflow-hidden text-ellipsis">
                          {ws.name}
                        </div>
                        <div className="text-[10.5px] font-mono text-[var(--color-text-tertiary)]">
                          @{ws.contextualUsername || `${user?.primaryUsername || 'user'}.${ws.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 ml-1.5">
                      <span className="text-[9.5px] font-semibold px-1.5 py-px rounded bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] border border-[var(--color-border-secondary)]">
                        Member
                      </span>
                      {isActive && <Check size={15} className="text-[var(--color-accent)]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* SECTION 4: ACTIONS */}
          <div className="mt-2 pt-2 border-t border-[var(--color-border-primary)] flex flex-col gap-0.5">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setCreateWsModalOpen(true);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-[var(--radius-sm)] bg-transparent border-none text-[12px] font-semibold text-[var(--color-accent)] cursor-pointer text-left hover:bg-[rgba(var(--color-accent-rgb),0.1)] transition-colors"
            >
              <Plus size={14} className="text-[var(--color-accent)]" />
              <span>Create New Workplace</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                navigate('/');
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-[var(--radius-sm)] bg-transparent border-none text-[12px] font-medium text-[var(--color-text-secondary)] cursor-pointer text-left hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              <Sparkles size={14} className="text-[var(--color-accent)]" />
              <span>All Contexts Hub</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ContextDropdown;
