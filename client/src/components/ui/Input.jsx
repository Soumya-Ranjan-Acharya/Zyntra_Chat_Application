import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const Input = React.forwardRef(({ label, type = 'text', error, className = '', ...rest }, ref) => {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          ref={ref}
          type={isPassword ? (show ? 'text' : 'password') : type}
          className={`w-full px-4 py-2.5 bg-[var(--color-bg-secondary)] border ${
            error ? 'border-red-400 focus:ring-red-400/30' : 'border-[var(--color-border-primary)] focus:border-[var(--color-accent)] focus:ring-[var(--color-accent)]/20'
          } text-[var(--color-text-primary)] rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 placeholder:text-[var(--color-text-tertiary)] transition-all ${isPassword ? 'pr-11' : ''} ${className}`}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
            onClick={() => setShow(!show)}
            tabIndex={-1}
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
