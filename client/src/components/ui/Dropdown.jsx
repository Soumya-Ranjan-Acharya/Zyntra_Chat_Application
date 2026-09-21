import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const DropdownItem = ({ children, onClick, icon: Icon, danger }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center px-4 py-2 text-sm transition-colors hover:bg-[var(--color-bg-hover)] ${
        danger ? 'text-red-500' : 'text-[var(--color-text-primary)]'
      }`}
    >
      {Icon && <Icon className="mr-2 h-4 w-4" />}
      {children}
    </button>
  );
};

const Dropdown = ({ trigger, children, align = 'right' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => setIsOpen(!isOpen);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div onClick={handleToggle} className="cursor-pointer">
        {trigger}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-50 mt-2 w-48 rounded-[var(--radius-md)] shadow-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)] py-1 focus:outline-none ${
              align === 'right' ? 'right-0 origin-top-right' : 'left-0 origin-top-left'
            }`}
          >
            <div className="py-1" onClick={() => setIsOpen(false)}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dropdown;
