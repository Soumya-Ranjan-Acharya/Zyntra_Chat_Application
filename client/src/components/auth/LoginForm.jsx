import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, Sparkles, Loader2 } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';

const inputStyle = (hasError) => ({
  width: '100%',
  padding: '11px 14px',
  backgroundColor: 'var(--color-bg-secondary, #f8fafc)',
  border: `1px solid ${hasError ? '#ef4444' : 'var(--color-border-primary, #cbd5e1)'}`,
  borderRadius: '10px',
  fontSize: '14px',
  color: 'var(--color-text-primary, #0f172a)',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 150ms ease, box-shadow 150ms ease',
  fontFamily: 'inherit',
});

const labelStyle = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 600,
  color: 'var(--color-text-secondary, #475569)',
  marginBottom: '6px',
};

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: { email: '', password: '', rememberMe: true },
  });

  const handleFillDemo = () => {
    setValue('email', 'soumya@zyntra.com');
    setValue('password', 'password123');
    setApiError(null);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setApiError(null);
    try {
      const res = await login(data.email.trim(), data.password);
      if (res && res.success) {
        navigate('/');
      } else {
        setApiError(res?.error || 'Invalid email or password. Please check your credentials.');
      }
    } catch (err) {
      setApiError(err.message || 'Server connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '380px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
        style={{ marginBottom: '24px' }}
      >
        <span
          style={{
            fontSize: '11px', fontWeight: 600,
            color: 'var(--color-accent, #3b82f6)',
            letterSpacing: '0.06em', textTransform: 'uppercase',
            display: 'block', marginBottom: '8px',
          }}
        >
          Secure sign in
        </span>
        <h2
          style={{
            fontSize: '28px', fontWeight: 800,
            color: 'var(--color-text-primary, #0f172a)',
            letterSpacing: '-0.03em', margin: '0 0 6px', lineHeight: 1.15,
          }}
        >
          Welcome back
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary, #64748b)', margin: 0 }}>
          Sign in to continue to Zyntra
        </p>
      </motion.div>

      {/* Error banner */}
      <AnimatePresence>
        {apiError && (
          <motion.div
            initial={{ opacity: 0, height: 0, x: -4 }}
            animate={{ opacity: 1, height: 'auto', x: 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              marginBottom: '14px', overflow: 'hidden',
              padding: '10px 12px',
              backgroundColor: 'rgba(239, 68, 68, 0.06)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: '10px',
              color: '#dc2626',
              fontSize: '12.5px',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}
          >
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            <span>{apiError}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Demo fill button */}
      <div style={{ marginBottom: '16px' }}>
        <motion.button
          type="button"
          onClick={handleFillDemo}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '6px 12px',
            backgroundColor: 'rgba(var(--color-accent-rgb, 59, 130, 246), 0.08)',
            border: '1px solid rgba(var(--color-accent-rgb, 59, 130, 246), 0.2)',
            borderRadius: '8px',
            fontSize: '11px', fontWeight: 600,
            color: 'var(--color-accent, #3b82f6)',
            cursor: 'pointer',
          }}
        >
          <Sparkles size={12} />
          Fill Demo Credentials
        </motion.button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Email */}
        <div>
          <label style={labelStyle}>Email address</label>
          <input
            type="email"
            placeholder="you@example.com"
            {...register('email', { required: 'Email is required' })}
            style={inputStyle(!!errors.email)}
            className="focus-glow"
          />
          {errors.email && (
            <p style={{ margin: '5px 0 0 2px', fontSize: '11px', color: '#ef4444' }}>{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label style={labelStyle}>Password</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••••"
              {...register('password', { required: 'Password is required' })}
              style={{ ...inputStyle(!!errors.password), paddingRight: '42px', letterSpacing: showPassword ? 'normal' : '0.1em' }}
              className="focus-glow"
            />
            <motion.button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              whileTap={{ scale: 0.85 }}
              style={{
                position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--color-text-tertiary, #94a3b8)',
                display: 'flex', alignItems: 'center', padding: 0,
              }}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </motion.button>
          </div>
          {errors.password && (
            <p style={{ margin: '5px 0 0 2px', fontSize: '11px', color: '#ef4444' }}>{errors.password.message}</p>
          )}
        </div>

        {/* Remember me + Forgot */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '7px', cursor: 'pointer', userSelect: 'none' }}>
            <input
              type="checkbox"
              {...register('rememberMe')}
              style={{ width: '15px', height: '15px', accentColor: 'var(--color-accent, #3b82f6)', cursor: 'pointer', margin: 0 }}
            />
            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary, #475569)', fontWeight: 500 }}>Remember me</span>
          </label>
          <Link
            to="/forgot-password"
            style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-accent, #3b82f6)', textDecoration: 'none' }}
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit button */}
        <motion.button
          type="submit"
          disabled={loading}
          whileHover={!loading ? { scale: 1.02 } : {}}
          whileTap={!loading ? { scale: 0.97 } : {}}
          style={{
            width: '100%', padding: '12px 16px',
            backgroundColor: 'var(--color-accent, #3b82f6)',
            color: '#ffffff', border: 'none', borderRadius: '10px',
            fontSize: '14px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            boxShadow: '0 4px 16px rgba(var(--color-accent-rgb, 59, 130, 246), 0.35)',
            transition: 'box-shadow 150ms ease',
            opacity: loading ? 0.75 : 1,
            letterSpacing: '-0.01em',
          }}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign in'
          )}
        </motion.button>
      </form>

      {/* Divider */}
      <div style={{ position: 'relative', margin: '22px 0', textAlign: 'center' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: '1px', backgroundColor: 'var(--color-border-primary, #e2e8f0)' }} />
        <span style={{ position: 'relative', padding: '0 12px', backgroundColor: 'var(--color-bg-primary, #ffffff)', fontSize: '11px', color: 'var(--color-text-tertiary, #94a3b8)' }}>
          New to Zyntra?
        </span>
      </div>

      {/* Register link */}
      <Link
        to="/register"
        style={{
          width: '100%', padding: '11px 16px',
          border: '1px solid var(--color-border-primary, #cbd5e1)',
          borderRadius: '10px',
          color: 'var(--color-accent, #3b82f6)',
          fontSize: '14px', fontWeight: 600,
          textAlign: 'center', textDecoration: 'none',
          backgroundColor: 'transparent',
          boxSizing: 'border-box', display: 'block',
          transition: 'background-color 150ms ease, border-color 150ms ease',
        }}
        className="hover:bg-[var(--color-bg-hover)] hover:border-[var(--color-border-secondary)]"
      >
        Create an account
      </Link>

      {/* Footer */}
      <div style={{ marginTop: '24px', textAlign: 'center' }}>
        <p style={{ margin: 0, fontSize: '10px', color: 'var(--color-text-tertiary, #94a3b8)', lineHeight: 1.6 }}>
          By continuing, you agree to Zyntra's Terms and Privacy Policy.
        </p>
        <p style={{ margin: '3px 0 0', fontSize: '10px', color: 'var(--color-text-tertiary, #94a3b8)' }}>
          © Zyntra
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
