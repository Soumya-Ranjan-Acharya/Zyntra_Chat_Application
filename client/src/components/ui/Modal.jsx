import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const maxWidthMap = { sm: '460px', md: '520px', lg: '680px' };

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-xs"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.15 }}
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
            color: '#0f172a',
            maxWidth: maxWidthMap[size] || maxWidthMap.md,
            width: '100%'
          }}
          className="relative overflow-hidden"
        >
          {title && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '18px 24px',
                borderBottom: '1px solid #f1f5f9',
                backgroundColor: '#ffffff'
              }}
            >
              <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
                {title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '6px',
                  borderRadius: '8px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'color 0.15s ease, background-color 0.15s ease'
                }}
                className="hover:bg-slate-100 hover:text-slate-900"
              >
                <X size={18} />
              </button>
            </div>
          )}
          <div style={{ padding: '24px 28px 28px 28px', backgroundColor: '#ffffff', color: '#0f172a', maxHeight: 'calc(85vh - 70px)', overflowY: 'auto' }}>
            {children}
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

export default Modal;
