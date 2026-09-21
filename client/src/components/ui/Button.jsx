import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)]',
  secondary: 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-active)] border border-[var(--color-border-primary)]',
  ghost: 'bg-transparent text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)]',
  danger: 'bg-red-500 text-white hover:bg-red-600',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
};

const Button = ({ variant = 'primary', size = 'md', children, className = '', loading, disabled, ...rest }) => (
  <button
    className={`inline-flex items-center justify-center font-medium rounded-[var(--radius-md)] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/40 focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none ${variants[variant]} ${sizes[size]} ${className}`}
    disabled={disabled || loading}
    {...rest}
  >
    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
    {children}
  </button>
);

export default Button;
