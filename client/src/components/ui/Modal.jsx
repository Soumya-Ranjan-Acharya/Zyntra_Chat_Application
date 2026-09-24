import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const maxWidthMap = { sm: '460px', md: '520px', lg: '680px' };

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
          onClick={onClose}
        />

        {/* Modal panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 12 }}
          transition={{ type: 'spring', stiffness: 420, damping: 32 }}
          style={{
            backgroundColor: 'var(--color-bg-primary)',
            border: '1px solid var(--color-border-primary)',
            borderRadius: '20px',
            boxShadow: '0 32px 64px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.05)',
            color: 'var(--color-text-primary)',
            maxWidth: maxWidthMap[size] || maxWidthMap.md,
            width: '100%',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {title && (
            <div
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '18px 24px',
                borderBottom: '1px solid var(--color-border-primary)',
              }}
            >
              <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
                {title}
              </h2>
              <motion.button
                type="button"
                onClick={onClose}
                whileTap={{ scale: 0.85 }}
                style={{
                  padding: '6px', borderRadius: '10px',
                  backgroundColor: 'transparent', border: 'none',
                  color: 'var(--color-text-tertiary)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
                className="hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]"
              >
                <X size={18} />
              </motion.button>
            </div>
          )}
          <div
            style={{
              padding: '24px 28px 28px',
              color: 'var(--color-text-primary)',
              maxHeight: 'calc(85vh - 70px)',
              overflowY: 'auto',
            }}
            className="custom-scrollbar"
          >
            {children}
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

export default Modal;
