import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';

const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [apiSuccess, setApiSuccess] = useState(null);
  const navigate = useNavigate();
  const registerUser = useAuthStore((s) => s.register);

  const {
    register: reg,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      primaryUsername: '',
      password: '',
      confirmPassword: '',
    },
  });

  const passwordVal = watch('password');

  const onSubmit = async (data) => {
    setLoading(true);
    setApiError(null);
    setApiSuccess(null);

    try {
      const res = await registerUser({
        name: data.name.trim(),
        email: data.email.trim(),
        primaryUsername: data.primaryUsername.trim().replace(/^@/, ''),
        password: data.password,
      });

      if (res && res.success) {
        setApiSuccess('Account created successfully! Entering Zyntra...');
        setTimeout(() => {
          navigate('/');
        }, 500);
      } else {
        setApiError(res?.error || 'Failed to create account. Please try again.');
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
      <div style={{ marginBottom: '18px' }}>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 600,
            color: '#64748b',
            letterSpacing: '0.05em',
            display: 'block',
            marginBottom: '4px',
          }}
        >
          Get started with Zyntra
        </span>
        <h2
          style={{
            fontSize: '26px',
            fontWeight: 800,
            color: '#0f172a',
            letterSpacing: '-0.03em',
            margin: '0 0 4px 0',
            lineHeight: 1.2,
          }}
        >
          Create account
        </h2>
        <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
          One permanent primary identity for all your workplaces
        </p>
      </div>

      {apiError && (
        <div
          style={{
            marginBottom: '14px',
            padding: '10px 12px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            color: '#b91c1c',
            fontSize: '12.5px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>{apiError}</span>
        </div>
      )}

      {apiSuccess && (
        <div
          style={{
            marginBottom: '14px',
            padding: '10px 12px',
            backgroundColor: '#ecfdf5',
            border: '1px solid #a7f3d0',
            borderRadius: '8px',
            color: '#047857',
            fontSize: '12.5px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
          <span>{apiSuccess}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
            Full name
          </label>
          <input
            placeholder="e.g. Soumya Mohanty"
            {...reg('name', { required: 'Name is required' })}
            style={{
              width: '100%',
              padding: '9px 12px',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              fontSize: '13px',
              color: '#0f172a',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          {errors.name && <p style={{ margin: '3px 0 0', fontSize: '11px', color: '#ef4444' }}>{errors.name.message}</p>}
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
            Email address
          </label>
          <input
            type="email"
            placeholder="you@example.com"
            {...reg('email', {
              required: 'Email is required',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Please enter a valid email address',
              },
            })}
            style={{
              width: '100%',
              padding: '9px 12px',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              fontSize: '13px',
              color: '#0f172a',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          {errors.email && <p style={{ margin: '3px 0 0', fontSize: '11px', color: '#ef4444' }}>{errors.email.message}</p>}
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
            Primary username (Permanent)
          </label>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              overflow: 'hidden',
            }}
          >
            <span style={{ padding: '0 0 0 10px', fontSize: '13px', color: '#94a3b8', fontWeight: 700, userSelect: 'none' }}>
              @
            </span>
            <input
              placeholder="username"
              {...reg('primaryUsername', {
                required: 'Username is required',
                minLength: { value: 3, message: 'Username must be at least 3 characters' },
                pattern: { value: /^[a-zA-Z0-9_.-]+$/, message: 'Only letters, numbers, dots, and underscores allowed' },
              })}
              style={{
                flex: 1,
                padding: '9px 10px',
                backgroundColor: 'transparent',
                border: 'none',
                fontSize: '13px',
                color: '#0f172a',
                outline: 'none',
              }}
            />
          </div>
          {errors.primaryUsername && (
            <p style={{ margin: '3px 0 0', fontSize: '11px', color: '#ef4444' }}>{errors.primaryUsername.message}</p>
          )}
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
            Password
          </label>
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••••••"
              {...reg('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' },
              })}
              style={{
                width: '100%',
                padding: '9px 36px 9px 12px',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '13px',
                color: '#0f172a',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#94a3b8',
                padding: 0,
              }}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {errors.password && (
            <p style={{ margin: '3px 0 0', fontSize: '11px', color: '#ef4444' }}>{errors.password.message}</p>
          )}
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
            Confirm password
          </label>
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••••••"
              {...reg('confirmPassword', {
                required: 'Please confirm your password',
                validate: (val) => val === passwordVal || 'Passwords do not match',
              })}
              style={{
                width: '100%',
                padding: '9px 36px 9px 12px',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '13px',
                color: '#0f172a',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#94a3b8',
                padding: 0,
              }}
              tabIndex={-1}
            >
              {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p style={{ margin: '3px 0 0', fontSize: '11px', color: '#ef4444' }}>{errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '11px 16px',
            backgroundColor: loading ? '#93c5fd' : '#1d63ff',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            marginTop: '4px',
            transition: 'background-color 0.15s ease',
          }}
        >
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '12px', color: '#64748b' }}>
        Already have an account?{' '}
        <Link to="/login" style={{ color: '#1d63ff', fontWeight: 600, textDecoration: 'none' }}>
          Sign in
        </Link>
      </div>
    </div>
  );
};

export default RegisterForm;
