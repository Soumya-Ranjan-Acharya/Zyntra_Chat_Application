import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const variants = {
  primary:   'bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] shadow-[0_4px_14px_rgba(var(--color-accent-rgb),0.35)]',
  secondary: 'bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-active)] border border-[var(--color-border-primary)]',
  ghost:     'bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]',
  danger:    'bg-red-500 text-white hover:bg-red-600 shadow-[0_4px_14px_rgba(239,68,68,0.3)]',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs rounded-[10px]',
  md: 'px-4 py-2.5 text-sm rounded-[12px]',
  lg: 'px-6 py-3 text-base rounded-[14px]',
};

const Button = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  loading,
  disabled,
  ...rest
}) => (
  <motion.button
    whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
    whileTap={!disabled && !loading ? { scale: 0.96 } : {}}
    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
    className={`
      inline-flex items-center justify-center font-semibold
      transition-all duration-150
      focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 focus:ring-offset-1
      disabled:opacity-50 disabled:pointer-events-none
      ${variants[variant]}
      ${sizes[size]}
      ${className}
    `}
    disabled={disabled || loading}
    {...rest}
  >
    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
    {children}
  </motion.button>
);

export default Button;
