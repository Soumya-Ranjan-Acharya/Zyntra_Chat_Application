import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Search, Info, ArrowLeft, Phone, Video, ShieldCheck, X, KeyRound } from 'lucide-react';
import Avatar from '../ui/Avatar';
import { encryptionService } from '../../services/encryptionService';

const ChatHeader = ({
  name = 'Chat',
  avatar = null,
  status = null,
  memberCount,
  isEncrypted = true,
  onInfoClick,
  onBackClick,
  policy = {}
}) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [showFingerprint, setShowFingerprint] = useState(false);

  return (
    <header
      className="pl-[48px] lg:pl-5 pr-5 py-2.5"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--color-border-primary)',
        backgroundColor: 'var(--color-bg-primary)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: '0 1px 0 rgba(0,0,0,0.04)',
        flexShrink: 0,
        userSelect: 'none',
        zIndex: 10,
        minHeight: '58px',
        position: 'relative',
      }}
    >
      {/* Left: Back + Avatar + Name */}
      <div className="flex items-center gap-3 min-w-0" style={{ flex: 1 }}>
        {onBackClick && (
          <motion.button
            onClick={onBackClick}
            whileTap={{ scale: 0.9 }}
            className="lg:hidden p-1.5 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] transition-colors"
            title="Back"
          >
            <ArrowLeft size={18} />
          </motion.button>
        )}

        <Avatar
          name={name}
          src={avatar}
          size="md"
          status={status !== null ? status : (memberCount != null ? null : 'online')}
        />

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2
              style={{
                fontSize: '15px',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                letterSpacing: '-0.02em',
                margin: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {name}
            </h2>
            {isEncrypted && (
              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setShowFingerprint(!showFingerprint)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px',
                    padding: '2px 7px',
                    borderRadius: '999px',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    color: '#10b981',
                    fontSize: '10px',
                    fontWeight: 600,
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                  title="Click to view E2EE cryptographic fingerprint"
                  className="hidden sm:inline-flex hover:opacity-80 transition-opacity"
                >
                  <ShieldCheck size={10} />
                  E2EE
                </button>
                <AnimatePresence>
                  {showFingerprint && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 5 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 5 }}
                      style={{
                        position: 'absolute',
                        top: 'calc(100% + 8px)',
                        left: 0,
                        width: '280px',
                        backgroundColor: 'var(--color-bg-primary)',
                        border: '1px solid var(--color-border-primary)',
                        boxShadow: 'var(--elevation-3)',
                        borderRadius: '12px',
                        padding: '12px',
                        zIndex: 50,
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1.5">
                          <Lock size={12} /> End-to-End Encrypted
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowFingerprint(false)}
                          className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
                        >
                          <X size={12} />
                        </button>
                      </div>
                      <p className="text-[11px] text-[var(--color-text-secondary)] leading-tight mb-2">
                        Messages are encrypted on your device with AES-256-GCM. Plaintext is never stored on the server.
                      </p>
                      <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)] rounded-lg p-2 font-mono text-[10px] text-[var(--color-text-primary)] break-all select-all">
                        <div className="text-[9px] uppercase tracking-wider text-[var(--color-text-tertiary)] mb-0.5">
                          Device Key Fingerprint
                        </div>
                        {encryptionService.getFingerprint() || 'Initializing...'}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginTop: '2px',
              fontSize: '12px',
              color: 'var(--color-text-secondary)',
            }}
          >
            {memberCount != null ? (
              <span>{memberCount.toLocaleString()} members</span>
            ) : (
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  color: '#10b981',
                  fontWeight: 500,
                }}
              >
                <span
                  className="status-online-pulse"
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: '#10b981',
                    display: 'inline-block',
                  }}
                />
                Active now
              </span>
            )}
            {policy?.title && (
              <>
                <span style={{ color: 'var(--color-border-secondary)', fontSize: '10px' }}>·</span>
                <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>{policy.title}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flexShrink: 0 }}>
        {/* Inline Search */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 200, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
              style={{ overflow: 'hidden' }}
            >
              <input
                autoFocus
                placeholder="Search messages..."
                style={{
                  width: '100%',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  border: '1px solid var(--color-accent)',
                  backgroundColor: 'var(--color-bg-secondary)',
                  color: 'var(--color-text-primary)',
                  fontSize: '13px',
                  outline: 'none',
                  boxShadow: 'var(--glow-accent-sm)',
                }}
                onKeyDown={(e) => e.key === 'Escape' && setSearchOpen(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <HeaderBtn
          onClick={() => setSearchOpen(!searchOpen)}
          title="Search in conversation"
          active={searchOpen}
        >
          {searchOpen ? <X size={17} /> : <Search size={17} />}
        </HeaderBtn>

        <HeaderBtn
          onClick={() => {}}
          title="Voice Call"
          className="hidden sm:flex"
        >
          <Phone size={17} />
        </HeaderBtn>

        <HeaderBtn
          onClick={() => {}}
          title="Video Call"
          className="hidden sm:flex"
        >
          <Video size={17} />
        </HeaderBtn>

        {onInfoClick && (
          <HeaderBtn
            onClick={onInfoClick}
            title="Conversation Details"
            accent
          >
            <Info size={18} />
          </HeaderBtn>
        )}
      </div>
    </header>
  );
};

const HeaderBtn = ({ children, onClick, title, active, accent, className = '' }) => (
  <motion.button
    onClick={onClick}
    whileTap={{ scale: 0.88 }}
    style={{
      width: '34px',
      height: '34px',
      borderRadius: '10px',
      border: 'none',
      backgroundColor: active
        ? 'rgba(var(--color-accent-rgb), 0.12)'
        : 'transparent',
      color: active
        ? 'var(--color-accent)'
        : accent
          ? 'var(--color-accent)'
          : 'var(--color-text-secondary)',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background-color 150ms ease, color 150ms ease',
      flexShrink: 0,
    }}
    className={`hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)] ${className}`}
    title={title}
  >
    {children}
  </motion.button>
);

export default ChatHeader;
